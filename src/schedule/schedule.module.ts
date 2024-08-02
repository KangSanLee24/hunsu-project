import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';
import { ChatLog } from 'src/chat/entities/chat-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag, ChatLog])],
  providers: [ScheduleService]
})
export class ScheduleModule {}
