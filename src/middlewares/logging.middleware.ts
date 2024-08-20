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
import { format } from 'date-fns';

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

    const token = headers.authorization?.split(' ')[1];
    let payload;
    if (token) {
      payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    }

    const userId = payload ? payload.sub : 0;
    const currentTime = new Date();

    // 2. 로그 남기기
    res.on('finish', () => {
      const { statusCode } = res;
      this.loggerService.log(
        `[${currentTime}][userId:${userId}][${method}][${statusCode}][${originalUrl}][IP:${ip}][${userAgent}]`
      );
    });

    next();
  }
}
