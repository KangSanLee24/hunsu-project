import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import _ from 'lodash';
import { UserService } from 'src/user/user.service';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  // passport 내장함수에 따라 jwt 토큰이 다시 분해되어 payload를 뽑아낸 후 validate함수에 매개변수로 넣어줌
  // 내장함수 자체에서 validate라는 함수명을 사용하므로 이름을 바꾸면 작동하지 않는다.
  // payload로 전달된 데이터를 통해 실제 유저 정보 조회
  async validate(payload: any) {
    // 1. 페이로드에 담긴 email을 통해 사용자 찾기
    const user = await this.userService.findByEmail(payload.email);
    // 1-1. 만약 존재하지 않는다면 에러메시지(404)
    if (_.isNil(user)) {
      throw new NotFoundException(AUTH_MESSAGES.JWT.FAILURE.NO_USER);
    }

    // 2. 로그인한 user 정보를 전달
    return user;
  }
}
