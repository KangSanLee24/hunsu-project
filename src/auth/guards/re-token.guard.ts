import {
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import _ from 'lodash';

@Injectable()
export class ReTokenGuard {
  constructor(
    private configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async ReTokenGuard(context: ExecutionContext) {
    // 1. req에서 RefreshToken 가져오기
    const request = context.switchToHttp().getRequest();
    const bearer = request.headers.authorization?.split(' ')[0];
    const refreshToken = request.headers.authorization?.split(' ')[1];
    // 1-1. 만약 토큰이 Bearer 형식이 아니면 에러처리
    if (bearer !== 'Bearer') {
      throw new UnauthorizedException(
        AUTH_MESSAGES.RE_TOKEN.FAILURE.NOT_SUPPORTED_TOKEN
      );
    }
    // 1-2. 만약 RefreshToken이 없으면 에러처리
    if (!refreshToken) {
      throw new UnauthorizedException(
        AUTH_MESSAGES.RE_TOKEN.FAILURE.NO_REFRESH_TOKEN
      );
    }

    // 2. payload 추출
    const payload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
    // 2-1. payload가 없으면 에러처리
    if (!payload) {
      throw new UnauthorizedException(
        AUTH_MESSAGES.RE_TOKEN.FAILURE.INVALID_TOKEN
      );
    }

    // 3. 토큰이 RefreshToken인지 검증
    if (payload.type !== 'RF') {
      throw new UnauthorizedException(
        AUTH_MESSAGES.RE_TOKEN.FAILURE.NOT_REFRESH_TOKEN
      );
    }

    // 4. 페이로드에 담긴 email을 통해 사용자 찾기
    const user = await this.userService.findByEmail(payload.email);
    // 4-1. 만약 존재하지 않는다면 에러메시지(404)
    if (_.isNil(user)) {
      throw new NotFoundException(AUTH_MESSAGES.JWT.FAILURE.NO_USER);
    }

    // 5. 검사 완료
    return true;
  }
}
