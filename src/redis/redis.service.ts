import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  constructor(private configService: ConfigService) {}

  /** Redis 모듈 시작 **/
  async onModuleInit() {
    const redisHost = this.configService.get<string>('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');
    const redisUser = this.configService.get<string>('REDIS_USER');
    const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
    const redisTls = this.configService.get<string>('REDIS_TLS') === 'true';

    this.client = new Redis({
      host: redisHost,
      port: redisPort || 6379,
      username: redisUser,
      password: redisPassword,
      tls: redisTls ? {} : undefined,
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      console.error('Redis error', err);
    });
  }

  /** Redis 모듈 종료 **/
  async onModuleDestroy() {
    await this.client.quit();
  }

  /** Redis GET **/
  async getValue(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /** Redis SET **/
  async setValue(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl);
    } else {
      await this.client.set(key, value);
    }
  }

  /** Redis DEL **/
  async deleteValue(key: string): Promise<number> {
    return this.client.del(key);
  }
}
