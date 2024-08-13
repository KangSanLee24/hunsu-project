import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';
import { HashtagModule } from 'src/hashtag/hashtag.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag]), HashtagModule, ChatModule],
  providers: [ScheduleService]
})
export class ScheduleModule {}
