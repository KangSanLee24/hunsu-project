import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { IncomingWebhook } from '@slack/webhook';
import { catchError, Observable, throwError } from 'rxjs';
import { TimeoutError } from 'rxjs/internal/operators/timeout';
import { QueryFailedError } from 'typeorm';

@Injectable()
export class SentryWebhookInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // 데이터 베이스 오류일 경우
        if (error instanceof QueryFailedError) {
          this.reportError(
            error,
            'danger',
            ':rotating_light: 데이터베이스 쿼리 오류 발생:rotating_light:'
          );
        }

        // 네트워크 타임 아웃 오류일 경우
        if (error instanceof TimeoutError) {
          this.reportError(
            error,
            'warning',
            ':rotating_light: 네트워크 요청 타임아웃 오류 발생:rotating_light:'
          );
        }

        // 참조 or 타입 오류일 경우
        if (error instanceof ReferenceError || error instanceof TypeError) {
          this.reportError(
            error,
            'danger',
            ':rotating_light: (참조|타입) 오류 발생:rotating_light:'
          );
        }

        // 오류 처리
        if (error instanceof HttpException) {
          // Http error는 그대로 반환
          return throwError(() => error);
        } else {
          // 그 외 오류는 internal server error로 반환
          return throwError(
            () =>
              new HttpException(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
              )
          );
        }
      })
    );
  }

  // sentry, slack에 오류 알림
  private reportError(error: Error, color: string, text: string) {
    // sentry에 오류 기록
    Sentry.captureException(error);

    const slackWebhook = this.configService.get<string>('SLACK_WEBHOOK');
    const webhook = new IncomingWebhook(slackWebhook);

    // slack에 오류 알림
    webhook.send({
      attachments: [
        {
          color,
          text, // 에러 메시지
          fields: [
            {
              title: error.message, // 에러 메시지
              value: error.stack, // 에러 발생 경로
              short: false, // 에러 로그 (true면 간략하게, false는 자세하게)
            },
          ],
          ts: Math.floor(new Date().getTime() / 1000).toString(), // 타임스탬프
        },
      ],
    });
  }
}
