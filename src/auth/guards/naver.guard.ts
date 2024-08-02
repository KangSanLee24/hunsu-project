import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class NaverAuthGuard extends AuthGuard('naver') {
  constructor() {
    super();
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException('네이버 계정 정보가 없습니다.');
    }
    return user;
  }
}
