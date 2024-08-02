import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ChatService } from 'src/chat/chat.service';
import { HashtagService } from 'src/hashtag/hashtag.service';

@Injectable()
export class ScheduleService {
    constructor(
        private readonly hashtagService: HashtagService,
        private readonly chatService: ChatService,
        ) {}

    /** 채팅방 , 해시태그 관련 스케줄러 **/

    //task1. 1분에 한번씩 채팅 내역 -> 해시태그로 이동
    //task2. 삭제 대상 채팅방 테이블 삭제

    @Cron(CronExpression.EVERY_MINUTE)
    async handleCron() {
        await this.task1();
        await this.task2();
      }
      
    async task1() {
        await this.hashtagService.createHashtags();
    }

    async task2() {
        await this.chatService.deleteChatRoom();
    }

}
