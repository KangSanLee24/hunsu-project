import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LogIn = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 1. 실행 컨텍스트에서 유저의 request를 추출
    const request = ctx.switchToHttp().getRequest();

    // 2. 로그인 된 상태라면 user정보를 반환
    return request.user ? request.user : null;
  }
);
