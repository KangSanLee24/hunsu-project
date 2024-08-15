import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SubRedisService } from './sub.redis.service';

@Module({
  imports: [],
  providers: [RedisService, SubRedisService],
  exports: [RedisService, SubRedisService],
})
export class RedisModule {}
