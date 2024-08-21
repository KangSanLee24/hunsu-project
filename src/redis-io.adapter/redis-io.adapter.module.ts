import { Module } from '@nestjs/common';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [RedisModule],
})
export class RedisIoAdapterModule {}
