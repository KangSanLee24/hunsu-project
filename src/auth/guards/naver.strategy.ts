import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-naver';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import _ from 'lodash';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { SocialType } from 'src/user/types/social-type.type';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(
    private readonly configService: ConfigService,
    private userService: UserService
  ) {
    super({
      clientID: configService.get('NAVER_CLIENT_ID'),
      clientSecret: configService.get('NAVER_CLIENT_SECRET'),
      callbackURL: configService.get('NAVER_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: Function
  ): Promise<any> {
    try {
      // 1. 유저정보
      const { _json } = profile;
      const user = {
        id: _json.id,
        accessToken,
        refreshToken,
      };

      // 2-에러없으면. null(에러없음) + user정보 전달
      done(null, user);
    } catch (err) {
      // 2-에러있으면. err(에러있음) + false 전달
      done(err, false);
    }
  }
}
