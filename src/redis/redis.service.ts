import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;

  constructor(private configService: ConfigService) {}

  /** Redis 모듈 시작 **/
  async onModuleInit() {
    const redisHost = this.configService.get<string>('POINT_REDIS_HOST');
    const redisPort = this.configService.get<number>('POINT_REDIS_PORT');
    const redisPassword = this.configService.get<string>(
      'POINT_REDIS_PASSWORD'
    );

    this.redisClient = new Redis({
      host: redisHost,
      port: redisPort || 6379,
      password: redisPassword,
    });

    this.redisClient.on('connect', () => {
      console.log('Connected to MAIN-Redis');
    });

    this.redisClient.on('error', (err) => {
      console.error('MAIN-Redis error', err);
    });
  }

  /** 클라이언트 함수 **/
  getClient(): Redis {
    return this.redisClient;
  }

  /** Redis 모듈 종료 **/
  async onModuleDestroy() {
    await this.redisClient.quit();
  }

  /** Redis GET **/
  async getValue(key: string): Promise<string | null> {
    const data = await this.redisClient.get(key);
    return data;
  }

  /** Redis SET **/
  async setValue(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  /** Redis DEL **/
  async delValue(key: string): Promise<number> {
    const data = await this.redisClient.del(key);
    return data;
  }

  /** Redis SortedSet GET(ZREVRANGE) - RANK **/
  async zgetRank(key: string, range?: any) {
    // range 수만큼 RANK불러오고, range 지정하지 않으면 전체RANK 불러옴
    const end = range ? range - 1 : -1;
    const data = await this.redisClient.zrevrange(key, 0, end, 'WITHSCORES');
    return data;
  }

  /** Redis SortedSet ZADD (추가; ※ 기존값이 있으면 대체되므로 주의!!) **/
  async zaddValue(key: string, data: any, needReturn: boolean): Promise<any[]> {
    let dataArray = [];
    for (let i = 0; i < data.length; i++) {
      await this.redisClient.zadd(key, data[i].point, data[i].nickname);
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
    await this.redisClient.zincrby(key, point, `${nickname}`);
  }

  /** Redis SortedSet GET score by value **/
}
