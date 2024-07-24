import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

import { compare, hash } from 'bcrypt';
import _ from 'lodash';

import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Point } from 'src/user/entities/point.entity';

import { SignUpDto } from './dtos/sign-up.dto';
import { LogInDto } from './dtos/log-in.dto';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

@Injectable()
export class AuthService {
  constructor(
    // for 트랜잭션
    private dataSource: DataSource,

    private userService: UserService,
    private readonly jwtService: JwtService
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
    const isExistingEmail = await this.userService.findByEmail(email);
    // 1-1. 이미 존재한다면 에러메시지(409)
    if (isExistingEmail) {
      throw new ConflictException(AUTH_MESSAGES.SIGN_UP.FAILURE.EXISTING_EMAIL);
    }

    // 2. 해당 nickname으로 가입한 user가 존재하는지?
    const isExistingNickname = await this.userService.findByNickname(nickname);
    // 2-1. 이미 존재한다면 에러메시지(409)
    if (isExistingNickname) {
      throw new ConflictException(
        AUTH_MESSAGES.SIGN_UP.FAILURE.EXISTING_NICKNAME
      );
    }

    // 3. 비밀번호는 hash할 것
    const hashedPassword = await hash(password, 10);
    console.log('====================================', hashedPassword);

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
      console.log('**************************', newMember);
      // 4-2-2. 포인트 테이블 생성 (포인트)
      const newPoint = await queryRunner.manager.save(Point, {
        userId: newMember.id,
        accPoint: 0,
      });
      // 4-2-3. 성공: 트랜잭션 묶음 종료: commit
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
      // 4-2-3. 실패: 도중에 에러 발생시: rollback
      console.log(err);
      await queryRunner.rollbackTransaction();
      // 4-3-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      // 5. 에러처리
      throw new InternalServerErrorException(AUTH_MESSAGES.SIGN_UP.FAILURE.ETC);
    }
  }

  /** 로그인(log-in) API **/
  async logIn(logInDto: LogInDto) {
    // 0. dto에서 데이터 꺼내기
    const { email, password } = logInDto;

    // 1. 해당 email로 가입된 사용자가 있는지 확인
    const user = await this.userService.findByEmail(email);

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

    // 4. 페이로드
    const payload = { email, sub: user.id };

    // 5. Access Token 발급
    return {
      greeting: `${user.nickname} 님, 어서오세요!`,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
