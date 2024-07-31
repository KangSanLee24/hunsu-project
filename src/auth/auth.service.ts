import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository, QueryFailedError } from 'typeorm';

import { compare, hash } from 'bcrypt';
import _ from 'lodash';

import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Point } from 'src/user/entities/point.entity';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';
import { FindIdDto } from './dtos/find-id.dto';
import { RePasswordDto } from './dtos/re-password.dto';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { VerifyEmail } from 'src/mail/entities/verify-email.entity';
import { MailService } from 'src/mail/mail.service';
import { SocialType } from 'src/user/types/social-type.type';

@Injectable()
export class AuthService {
  constructor(
    // for 트랜잭션
    private dataSource: DataSource,

    private configService: ConfigService,
    private userService: UserService,
    private mailService: MailService,
    private readonly jwtService: JwtService,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

    @InjectRepository(VerifyEmail)
    private verifyEmailRepository: Repository<VerifyEmail>
  ) {}

  /** 회원 가입(sign-up) API **/
  async signUp(signUpDto: SignUpDto) {
    // 0. dto에서 데이터 꺼내기
    const { email, nickname, password, passwordConfirm } = signUpDto;
    // 0-1. dto 자체 검증
    if (password !== passwordConfirm) {
      throw new BadRequestException(AUTH_MESSAGES.SIGN_UP.FAILURE.NOT_MATCHED);
    }

    // 1. 해당 email로 가입한 user가 존재하는지?
    const isExistingEmail: User = await this.userService.findByEmail(email);
    // 1-1. 이미 존재한다면 에러메시지(409)
    if (isExistingEmail) {
      throw new ConflictException(AUTH_MESSAGES.SIGN_UP.FAILURE.EXISTING_EMAIL);
    }

    // 2. 해당 nickname으로 가입한 user가 존재하는지?
    const isExistingNickname: User =
      await this.userService.findByNickname(nickname);
    // 2-1. 이미 존재한다면 에러메시지(409)
    if (isExistingNickname) {
      throw new ConflictException(
        AUTH_MESSAGES.SIGN_UP.FAILURE.EXISTING_NICKNAME
      );
    }

    // 3. 비밀번호는 hash할 것
    const hashedPassword = await hash(password, 10);

    // 4. 트랜잭션 : 회원 가입 + 포인트 테이블 생성
    // 4-1. 트랜잭션 세팅
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // 4-2. 트랜잭션 묶기
    try {
      // 4-2-1. 신규 회원 데이터 생성 (회원 가입)
      const newMember = await queryRunner.manager.save(User, {
        email: signUpDto.email,
        nickname: signUpDto.nickname,
        password: hashedPassword,
      });
      // 4-2-2. 포인트 테이블 생성 (포인트)
      const newPoint = await queryRunner.manager.save(Point, {
        userId: newMember.id,
        accPoint: 0,
      });
      // 4-2-3. 인증 이메일 발송
      await this.mailService.sendEmail(newMember.email);

      // 4-2-4. 성공: 트랜잭션 묶음 종료: commit
      await queryRunner.commitTransaction();
      // 4-3-성공시. 트랜잭션 된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();

      // 5. 데이터 가공
      const newMemberData = {
        email: newMember.email,
        nickname: newMember.nickname,
        role: newMember.role,
        point: newPoint.accPoint,
      };
      // 6. 리턴
      return newMemberData;
    } catch (err) {
      // 4-2-4. 실패: 도중에 에러 발생시: rollback
      await queryRunner.rollbackTransaction();
      // 4-3-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      // 4-4. 이메일 중복 예외 처리
      if (
        err instanceof QueryFailedError &&
        err.driverError.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException(AUTH_MESSAGES.SIGN_UP.FAILURE.RESTORE);
      }
      // 5. 에러처리
      throw err;
    }
  }

  /** 로그인(log-in) API **/
  async logIn(logInDto: LogInDto) {
    // 0. dto에서 데이터 꺼내기
    const { email, password } = logInDto;

    // 1. 해당 email로 가입된 사용자가 있는지 확인
    const user: User = await this.userService.findByEmail(email);

    // 2. 해당 user가 없다면 에러메시지(404)
    if (_.isNil(user)) {
      throw new NotFoundException(AUTH_MESSAGES.LOG_IN.FAILURE.NO_USER);
    }

    // 3. 비밀번호가 일치하지 않는다면 에러메시지(401)
    const matched = await compare(password, user.password);
    if (!matched) {
      throw new UnauthorizedException(
        AUTH_MESSAGES.LOG_IN.FAILURE.WRONG_PASSWORD
      );
    }

    // 4. 이메일 인증을 아직 하지 않았다면 에러메시지
    if (user.verifiedEmail !== true) {
      throw new UnauthorizedException(
        AUTH_MESSAGES.LOG_IN.FAILURE.NOT_VERIFIED
      );
    }

    // 5. 페이로드
    const payloadAC = {
      type: 'AC',
      email: email,
      sub: user.id,
    };
    const payloadRF = {
      type: 'RF',
      email: email,
      sub: user.id,
    };

    // 6. 토큰 발급
    // 6-1. AccessToken 발급
    const accessToken = this.jwtService.sign(payloadAC, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('ACCESS_EXPIRES_IN'),
    });
    // 6-2. RefreshToken 발급
    const refreshToken = this.jwtService.sign(payloadRF, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('REFRESH_EXPIRES_IN'),
    });
    // 6-2-1. 이미 존재하는 RefreshToken인가?
    const isExistingRT = this.refreshTokenRepository.findBy({
      userId: user.id,
    });
    if (isExistingRT) {
      await this.refreshTokenRepository.delete({ userId: user.id });
    }
    // 6-2-2. RefreshToken을 DB에 저장
    await this.refreshTokenRepository.save({
      userId: user.id,
      refreshToken: refreshToken,
    });

    // 7. 토큰 발급 및 반환
    return {
      greeting: `${user.nickname} 님, 어서오세요!`,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /** 3. 로그아웃(log-out) API **/
  async logOut(user: User) {
    // 0. user에서 데이터 가져오기
    const userId = user.id;

    // 1. RefreshToken이 존재하는지 확인
    const isExistingToken = await this.refreshTokenRepository.findOneBy({
      userId,
    });
    // 1-1. 존재하지 않으면 에러처리 = 이미 로그아웃 된 상태
    if (!isExistingToken) {
      throw new BadRequestException(AUTH_MESSAGES.LOG_OUT.FAILURE.NO_TOKEN);
    }

    // 2. RefreshToken 삭제
    await this.refreshTokenRepository.delete({
      userId,
    });

    // 3. 반환
    return {
      goodbye: `${user.nickname} 님의 계정이 안전하게 로그아웃 되었습니다.`,
    };
  }

  /** 4. 토큰 재발급 API **/
  async reToken(user: User, refreshToken: string) {
    try {
      // 0. user에서 데이터 가져오기
      const userId = user.id;
      const email = user.email;

      // 1. RefreshToken에서 payload로 변환
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 2.에 앞서, 현재 passport에서 검증된 내용들 :
      // 1> 가드에서 토큰이 jwt 형식이 맞는지,
      // 2> 그리고 실존하는 userId인지만 검증된 상태이므로
      // 아래 로직으로 추가 검증 필요

      // 2. payload에 있는 email과 로그인한 유저 email이 동일한가?
      if (email !== payload.email) {
        // 2-1. 아니라면 에러처리(타인의 RefreshToken 사용중)
        throw new UnauthorizedException(
          AUTH_MESSAGES.RE_TOKEN.FAILURE.NOT_MATCHED_EMAIL
        );
      }

      // 3. payload에 있는 userId로 RefreshToken 검증
      const isValidRefreshToken: RefreshToken =
        await this.refreshTokenRepository.findOneBy({
          userId,
        });
      // 3-1. 만약 존재하지 않는다면 (외부에서 강제 로그아웃 시킨 경우) 에러처리
      if (!isValidRefreshToken) {
        throw new UnauthorizedException(
          AUTH_MESSAGES.RE_TOKEN.FAILURE.NO_REFRESH_TOKEN
        );
      }
      // 3-2. 로그인한 유저가 가진 RefreshToken과 DB에 있는 RefreshToken이 다른 경우
      if (refreshToken !== isValidRefreshToken.refreshToken) {
        throw new UnauthorizedException(
          AUTH_MESSAGES.RE_TOKEN.FAILURE.NOT_MATCHED_REFRESH_TOKEN
        );
      }

      // 4. 토근 재발급
      const payloadAC = {
        type: 'AC',
        email: email,
        sub: user.id,
      };
      const accessToken = this.jwtService.sign(payloadAC, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_EXPIRES_IN'),
      });

      // 5. 반환
      return accessToken;
    } catch (err) {
      // 0. 에러처리
      throw new UnauthorizedException(
        AUTH_MESSAGES.RE_TOKEN.FAILURE.INVALID_TOKEN
      );
    }
  }

  /** 5. 이메일 인증 API **/
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // 0. dto에서 데이터 추출
    const { email, certification } = verifyEmailDto;

    // 1. 해당 email로 인증번호를 받은 것이 맞는지 확인
    const isExistingEmail = await this.verifyEmailRepository.findOneBy({
      email,
    });
    // 1-1. 그렇지 않다면 에러처리
    if (!isExistingEmail) {
      throw new BadRequestException(
        AUTH_MESSAGES.VERIFY_EMAIL.FAILURE.WRONG_EMAIL
      );
    }

    // 2. 인증번호가 일치하는지 검증. 불일치 시 에러처리
    if (certification !== isExistingEmail.certification) {
      throw new BadRequestException(
        AUTH_MESSAGES.VERIFY_EMAIL.FAILURE.WRONG_CERTIFICATION
      );
    }

    // 3. 더이상 사용하지 않는 데이터 삭제
    await this.verifyEmailRepository.delete({ email });

    // 4. 해당 email에 대한 인증여부를 true로 변경
    await this.userRepository.update(
      { email },
      {
        verifiedEmail: true,
      }
    );
    // 5. 결과 반환
    return {
      verified: email,
    };
  }

  /** 6-1. 소셜로그인 - 네이버 **/
  async logInNaver(req: any) {
    try {
      // 0. 필요한 정보 받아오기 + 생성
      const naverUser = req.user;
      const hashedPassword = await hash(naverUser.id, 10);
      const user = {
        email: `${naverUser.id}@naver.com`,
        nickname: `NAVER${naverUser.id}`,
        password: hashedPassword,
        verifyEmail: true,
        socialId: naverUser.id,
        type: SocialType.NAVER,
      };

      // 1. 가입한 회원인지 확인
      const isExistingUser = await this.userRepository.findOneBy({
        email: user.email,
      });
      // 1-1. 가입한 회원이 아니라면 소셜계정으로 회원가입

      if (!isExistingUser) {
        // 2. 트랜잭션 시작
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        // 3. 트랜잭션 묶기
        try {
          // 3-1. 신규 회원 데이터 생성 (회원 가입)
          const newMember = await queryRunner.manager.save(User, {
            email: user.email,
            nickname: user.nickname,
            password: user.password,
            verifiedEmail: user.verifyEmail,
            socialId: user.socialId,
            type: user.type,
          });
          // 3-2. 포인트 테이블 생성 (포인트)
          const newPoint = await queryRunner.manager.save(Point, {
            userId: newMember.id,
            accPoint: 0,
          });

          // 3-3. 성공: 트랜잭션 묶음 종료: commit
          await queryRunner.commitTransaction();
          // 3-4-성공시. 트랜잭션 된 상태를 release하면서 트랜잭션 최종완료
          await queryRunner.release();
        } catch (err) {
          // 3-3. 실패: 도중에 에러 발생시: rollback
          await queryRunner.rollbackTransaction();
          // 3-4-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
          await queryRunner.release();

          // 3-5. 에러처리
          throw new UnauthorizedException(
            '[네이버 로그인] 가입에서 오류가 발생하였습니다.'
          );
        }
      }

      // 4. 로그인
      const logInDto = {
        email: user.email,
        password: naverUser.id,
      };
      const data = await this.logIn(logInDto);

      // 5. 반환
      return data;
    } catch (err) {
      throw err;
    }
  }

  /** 6-2. 소셜로그인 - 구글 **/
  async logInGoogle() {}

  // /** 토큰 발급 **/
  // async createToken(user, refresh) {
  //   const payload = {
  //     type: refresh ? 'RF' : 'AC',
  //     email: user.email,
  //     sub: user.id,
  //   };
  //   const key = refresh ?
  // }

  // /** 6. 비밀번호 바꾸기 API **/
  // async rePassword(rePasswordDto: RePasswordDto) {
  //   // 0. dto에서 데이터 꺼내기
  //   const { password, passwordConfirm } = rePasswordDto;

  //   // 2. 내 정보 수정
  //   const user: User = await this.userService.update(
  //     { password: user.password },
  //     { nickname: updateUserDto.nickname }
  //   );

  //   // 4. 데이터 가공
  //   const data = {
  //     before: {
  //       nickname: user.nickname,
  //     },
  //     after: {
  //       nickname: updateUserDto.nickname,
  //     },
  //   };

  //   // 5. 반환
  //   return data;
  // }

  /** 7. 아이디 찾기(find-id) API **/
  async findId(findIdDto: FindIdDto) {
    // 0. dto에서 데이터 꺼내기
    const { nickname } = findIdDto;

    // 1. 해당 email로 가입된 사용자가 있는지 확인
    const user: User = await this.userService.findByNickname(nickname);

    // 2. 해당 user가 없다면 에러메시지(404)
    if (_.isNil(user)) {
      throw new NotFoundException(AUTH_MESSAGES.FIND_ID.FAILURE.NO_USER);
    }

    // 3. 사용자 이메일 반환
    return {
      greeting: `당신의 아이디는 ${user.email} 입니다!`,
    };
  }
}
