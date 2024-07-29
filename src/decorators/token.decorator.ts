import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 실행 컨텍스트에서 토큰을 뽑아주는 데코레이터
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 1. 실행 컨텍스트에서 유저의 request를 추출
    const request = ctx.switchToHttp().getRequest();

    // 2. request에서 headers에 담겨있는 토큰을 추출(앞에 'Bearer' 제거)
    const token = request.headers.authorization?.split(' ')[1];

    // 3. 토큰을 반환 (없으면 null로 반환)
    return token ? token : null;
  }
);
