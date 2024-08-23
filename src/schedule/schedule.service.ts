import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { HashtagService } from 'src/hashtag/hashtag.service';
import { LogService } from 'src/log/log.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly hashtagService: HashtagService,
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly logService: LogService
  ) {}

  /** 해시태그 관련 스케줄러 **/

  // task 1 레디스에 만료기간 해시태그 삭제하기 (매일 자정)

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteHashtag() {
    await this.hashtagService.deleteHashtag();
  }

  /** 유저 관련 스케줄러 **/

  // task 1 유효기간 내 이메일 인증을 완료하지 않은 유저 삭제 (1분마다)

  @Cron(CronExpression.EVERY_MINUTE)
  async deleteUsers() {
    await this.authService.removeUserNotVerify();
  }

  /** 로그 관련 스케줄러 **/

  // task 1 로그파일의 데이터를 DB로 이전 (1분마다)

  @Cron(CronExpression.EVERY_MINUTE)
  async transferLogs() {
    await this.logService.insertLogs();
  }
}
