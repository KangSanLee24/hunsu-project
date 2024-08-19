import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SubRedisService implements OnModuleInit, OnModuleDestroy {
  private subRedisClient: Redis;

  constructor(private configService: ConfigService) {}

  /** Redis 모듈 시작 **/
  async onModuleInit() {
    const redisHost = this.configService.get<string>('SUB_REDIS_HOST');
    const redisPort = this.configService.get<number>('SUB_REDIS_PORT');
    const redisUser = this.configService.get<string>('SUB_REDIS_USER');
    const redisPassword = this.configService.get<string>('SUB_REDIS_PASSWORD');
    const redisTls = this.configService.get<string>('SUB_REDIS_TLS') === 'true';

    this.subRedisClient = new Redis({
      host: redisHost,
      port: redisPort || 14966,
      username: redisUser,
      password: redisPassword,
      tls: redisTls ? {} : undefined,
    });

    this.subRedisClient.on('connect', () => {
      console.log('Connected to SUB-Redis');
    });

    this.subRedisClient.on('error', (err) => {
      console.error('SUB-Redis error', err);
    });
  }

  /** Redis 모듈 종료 **/
  async onModuleDestroy() {
    await this.subRedisClient.quit();
  }

  /** Redis GET **/
  async getValue(key: string): Promise<string | null> {
    return this.subRedisClient.get(key);
  }

  /** Redis SET **/
  async setValue(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.subRedisClient.set(key, value, 'EX', ttl);
    } else {
      await this.subRedisClient.set(key, value);
    }
  }

  /** Redis DEL **/
  async deleteValue(key: string): Promise<number> {
    return this.subRedisClient.del(key);
  }

    /** 클라이언트 함수 **/
  getSubClient(): Redis {
    return this.subRedisClient;
  }
}
