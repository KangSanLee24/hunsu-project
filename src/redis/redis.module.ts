import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { PostRedisService } from './post.redis.service';

@Module({
  imports: [],
  providers: [RedisService, PostRedisService],
  exports: [RedisService, PostRedisService],
})
export class RedisModule {}
