import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  constructor(private configService: ConfigService) {}

  /** Redis 모듈 시작 **/
  async onModuleInit() {
    const redisHost = this.configService.get<string>('POINT_REDIS_HOST');
    const redisPort = this.configService.get<number>('POINT_REDIS_PORT');
    const redisUser = this.configService.get<string>('POINT_REDIS_USER');
    const redisPassword = this.configService.get<string>(
      'POINT_REDIS_PASSWORD'
    );
    const redisTls =
      this.configService.get<string>('POINT_REDIS_TLS') === 'true';

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
    const data = await this.client.get(key);
    return data;
  }

  /** Redis SET **/
  async setValue(key: string, value: string, ttl?: number): Promise<void> {
    await this.client.set(key, value);
    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }

  /** Redis DEL **/
  async delValue(key: string): Promise<number> {
    const data = await this.client.del(key);
    return data;
  }

  /** Redis SortedSet GET(ZREVRANGE) - RANK **/
  async zgetRank(key: string, range?: any) {
    // range 수만큼 RANK불러오고, range 지정하지 않으면 전체RANK 불러옴
    const end = range ? range - 1 : -1;
    const data = await this.client.zrevrange(key, 0, end, 'WITHSCORES');
    return data;
  }

  /** Redis SortedSet ZADD (추가; ※ 기존값이 있으면 대체되므로 주의!!) **/
  async zaddValue(key: string, data: any, needReturn: boolean): Promise<any[]> {
    let dataArray = [];
    for (let i = 0; i < data.length; i++) {
      await this.client.zadd(key, data[i].point, data[i].nickname);
      if (needReturn) {
        dataArray.push(data[i].nickname);
        dataArray.push(data[i].point);
      }
    }
    return dataArray;
  }

  /** Redis SortedSet INCRBY (증감; 기존값이 없으면 새로 생성!! 굿!!) **/
  async zincrbyValue(
    key: string,
    point: number,
    nickname: string
  ): Promise<void> {
    await this.client.zincrby(key, point, `${nickname}`);
  }

  /** Redis SortedSet GET score by value **/
}
