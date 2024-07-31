import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const LogInKakao = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // 1. 실행 컨텍스트에서 유저의 request를 추출
    const kakao = ctx.switchToHttp().getRequest();

    // 2. 실행 컨텍스트에서 서버의 response를 추출
    const tokens = ctx.switchToHttp().getResponse();

    // 3. 반환
    const kakaoData = { kakao, tokens };
    return kakaoData;
  }
);
