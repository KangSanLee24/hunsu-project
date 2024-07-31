import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';

/** 3. 소셜로그인 - 카카오 **/
// @Injectable()
// export class KakaoStrategy extends PassportStrategy(Strategy) {
//   // constructor(private readonly configService: ConfigService) {
//   //   super({
//   //     // 1. 요청(to.카카오) : [POST] oauth/token
//   //     clientID: configService.get('KAKAO_CLIENT_ID'),
//   //     clientSecret: '',
//   //     callbackURL: `${configService.get('KAKAO_BACKEND_URL')}/auth/kakao`,
//   //   });
//   // }
//   // async validate(
//   //   // 2. 응답(from.카카오) : [POST] oauth/token
//   //   accessToken: string,
//   //   refreshToken: string,
//   //   profile: Profile,
//   //   done: (error: any, user?: any, info?: any) => void
//   // ) {
//   //   try {
//   //     const { _json } = profile;
//   //     const user = {
//   //       kakaoId: _json.id,
//   //     };
//   //     done(null, user);
//   //   } catch (error) {
//   //     done(error);
//   //   }
//   // }
// }
