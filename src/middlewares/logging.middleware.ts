import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(
    @Inject(Logger) private readonly loggerService: LoggerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 1. 필요한 데이터 정리
    const { ip, method, originalUrl, headers } = req;
    const userAgent = req.get('user-agent');
    const currentTime = Date.now();

    // 2. 현재 로그인한 유저 정보
    const token = headers.authorization
      ? headers.authorization?.split(' ')[1]
      : null;
    let payload;
    let userId = 0;

    if (token) {
      try {
        payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        userId = payload ? payload.sub : 0; // payload가 유효한 경우에만 userId 설정
      } catch (error) {
        this.loggerService.log(`JWT verification error: ${error.message}`);
        // 기본 사용자 ID 설정
      }
    }

    // 3. 로그 남기기
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - currentTime;
      const logMessage = {
        context: 'UserRequest',
        message: `USER|${userId}][IP|${ip}][METHOD|${method}][SCODE|${statusCode}][DT|${duration}][URL|${originalUrl}][UA|${userAgent}`,
      };
      this.loggerService.log(logMessage);
    });

    next();
  }
}
