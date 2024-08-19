import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from 'src/chat/chat.service';
import { HashtagService } from 'src/hashtag/hashtag.service';

@Injectable()
export class ScheduleService {
    constructor(
        private readonly hashtagService: HashtagService,
        private readonly chatService: ChatService,
        private readonly authService: AuthService,
        ) {}

    /** 채팅방 , 해시태그 관련 스케줄러 **/

    // task 1 삭제 대상 채팅방 테이블 삭제 (1분마다)

    @Cron(CronExpression.EVERY_MINUTE)
    async deleteChatRoom() {
        await this.chatService.deleteChatRoom();
    }

    // task 2 레디스에 만료기간 해시태그 삭제하기 (매일 자정)

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async deleteHashtag() {
        await this.hashtagService.deleteHashtag();
    }


     /** 유저 관련 스케줄러 **/

     // task 1 유효기간 내 이메일 인증을 완료하지 않은 유저 삭제 (5분마다)

     @Cron(CronExpression.EVERY_5_MINUTES)
    async deleteUsers() {
        await this.authService.removeUserNotVerify();
    }
}



