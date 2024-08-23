import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashtagModule } from 'src/hashtag/hashtag.module';
import { ChatModule } from 'src/chat/chat.module';
import { LogModule } from 'src/log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), HashtagModule, ChatModule, LogModule],
  providers: [ScheduleService],
})
export class ScheduleModule {}
