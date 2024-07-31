import {
  ConflictException,
  Injectable,
  NotFoundException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Point } from './entities/point.entity';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { USER_MESSAGES } from 'src/constants/user-message.constant';
import { PointLog } from './entities/point-log.entity';
import { SoftdeleteUserDto } from './dtos/softdelete-user.dto';

@Injectable()
export class UserService {
  updateUserPassword(user: User) {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Point)
    private pointRepository: Repository<Point>,

    @InjectRepository(PointLog)
    private pointLogRepository: Repository<PointLog>
  ) { }

  /** 내 정보 조회(R) API **/
  async myProfile(user: User) {
    // 1. 사용자 정보 조회
    const profile: User = await this.findByUserId(user.id);

    // 2. 사용자 포인트 조회
    const point: Point = await this.findPointByUserId(user.id);

    // 3. 데이터 가공
    const data = {
      email: profile.email,
      nickname: profile.nickname,
      point: point.accPoint,
      role: profile.role,
      joinDate: profile.createdAt,
    };

    // 4. 반환
    return data;
  }

  /** 내 정보 수정(U) API **/
  async updateMyProfile(user: User, updateUserDto: UpdateUserDto) {
    // 0. dto에서 데이터 꺼내기
    const { nickname } = updateUserDto;

    // 1. nickname을 변경한다면 중복이 존재하는지 확인
    const isExistingNickname: User = await this.userRepository.findOneBy({
      nickname,
    });
    // 1-1. 변경하고싶은 nickname이 이미 사용중인 nickname이면 에러처리
    if (isExistingNickname) {
      throw new ConflictException({
        message: USER_MESSAGES.UPDATE_ME.FAILURE.EXISTING_NICKNAME,
      });
    }

    // 2. 내 정보 수정
    await this.userRepository.update(
      { id: user.id },
      { nickname: updateUserDto.nickname }
    );

    // 4. 데이터 가공
    const data = {
      before: {
        nickname: user.nickname,
      },
      after: {
        nickname: updateUserDto.nickname,
      },
    };

    // 5. 반환
    return data;
  }

  /** 사용자 정보 조회(R) API **/
  async getUserInfo(userId: number) {
    // 1. 사용자 정보 조회
    const user: User = await this.findByUserId(userId);

    // 2. 사용자 포인트 조회
    const point: Point = await this.findPointByUserId(userId);

    // 3. 데이터 가공
    const data = {
      nickname: user.nickname,
      point: point.accPoint,
      role: user.role,
      joinDate: user.createdAt,
    };

    // 4. 반환
    return data;
  }

  /** userId로 사용자 찾기(+) **/
  async findByUserId(userId: number) {
    return await this.userRepository.findOneBy({ id: userId });
  }

  /** userId로 포인트 조회(+) **/
  async findPointByUserId(userId: number) {
    return await this.pointRepository.findOneBy({ userId });
  }

  /** userId로 특정 기간 포인트로그 조회(+) **/ // ------ 기간 필터기능 필요!!
  async findPointLogsByUserId(userId: number) {
    const pointLogs = await this.pointLogRepository.find({
      where: {
        userId,
      },
    });
  } /////////////////////////////수정할 예정////////////////////////////////

  /** email로 사용자 찾기(+) **/
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // /** deletedAt으로 인증여부 확인하기(+) **/
  // async findByDeletedAt(deletedAt: Date) {
  //   return await this.userRepository.findOneBy({ deletedAt });
  // }

  /** nickname으로 사용자 찾기(+) **/
  async findByNickname(nickname: string) {
    return await this.userRepository.findOneBy({ nickname });
  }

  /** 비밀번호 바꾸기 API **/
  async updateMyPassword(user: User, updateUserDto: UpdateUserDto) {
    // 0. dto에서 데이터 꺼내기
    const { nickname } = updateUserDto;

    // 1. nickname을 변경한다면 중복이 존재하는지 확인
    const isExistingNickname: User = await this.userRepository.findOneBy({
      nickname,
    });
    // 1-1. 변경하고싶은 nickname이 이미 사용중인 nickname이면 에러처리
    if (isExistingNickname) {
      throw new ConflictException({
        message: USER_MESSAGES.UPDATE_ME.FAILURE.EXISTING_NICKNAME,
      });
    }

    // 2. 내 정보 수정
    await this.userRepository.update(
      { id: user.id },
      { nickname: updateUserDto.nickname }
    );

    // 4. 데이터 가공
    const data = {
      before: {
        nickname: user.nickname,
      },
      after: {
        nickname: updateUserDto.nickname,
      },
    };

    // 5. 반환
    return data;
  }

  /** 회원탈퇴 API*/
  async softdeleteUser(user: User, softdeleteUserDto: SoftdeleteUserDto) {
    const foundUser = await this.userRepository.findOne({ where: { id: user.id } });

    // 유저가 존재하는지 확인
    if (!foundUser) {
      throw new NotFoundException(USER_MESSAGES.DELETE_ME.NOT_FOUND);
    }

    // 유저 정보를 업데이트
    user.nickname = `탈퇴한 회원입니다 : ${user.nickname}`
    user.deletedAt = new Date();

    return this.userRepository.save(user);
  }
}
