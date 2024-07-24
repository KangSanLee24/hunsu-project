import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /** 내 정보 조회 API **/
  async myProfile(user: User) {
    const profile = await this.findByUserId(user.id);
    // 여기서 한번에 랭킹 정보도 표시할 것인지 의논해보기 **********
    return {
      email: profile.email,
      nickname: profile.nickname,
      role: profile.role,
    };
  }

  /** userId로 사용자 찾기(+) **/
  async findByUserId(userId: number) {
    return await this.userRepository.findOneBy({ id: userId });
  }

  /** email로 사용자 찾기(+) **/
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  /** nickname으로 사용자 찾기(+) **/
  async findByNickname(nickname: string) {
    return await this.userRepository.findOneBy({ nickname });
  }
}
