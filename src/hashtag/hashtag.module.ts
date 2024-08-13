import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([]), RedisModule],
  controllers: [HashtagController],
  exports: [HashtagService], 
  providers: [HashtagService],
})
export class HashtagModule {}
