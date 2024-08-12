import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private configService: ConfigService;
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: 'redis-17640.c340.ap-northeast-2-1.ec2.redns.redis-cloud.com',
      port: 17640,        // Redis 서버 포트
      password: this.configService.get<string>('REDIS_PASSWORD'),  // Redis 서버의 비밀번호
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis error: ', err);
    });
  }

  getClient(): Redis {
    return this.redisClient;
  }
}