import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatLog } from 'src/chat/entities/chat-log.entity';
import { Hashtag } from './entities/hashtag.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag, ChatLog]), RedisModule],
  controllers: [HashtagController],
  exports: [HashtagService], 
  providers: [HashtagService],
})
export class HashtagModule {}
