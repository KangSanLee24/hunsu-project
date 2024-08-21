import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ShoppingService {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.CLIENT_ID = this.configService.get<string>('CLIENTID');
    this.CLIENT_SECRET = this.configService.get<string>('CLIENTSECRET');
  }

  /* 네이버 쇼핑 API 상품 검색 */
  async search(keyword: string) {
    const client = this.redisService.getClient();

    const url = `https://openapi.naver.com/v1/search/shop.json?query=${keyword}&display=5`;
    const headers = {
      'X-Naver-Client-Id': this.CLIENT_ID,
      'X-Naver-Client-Secret': this.CLIENT_SECRET,
    };

    try {
      // 1. Redis에 저장된 값 먼저 확인
      // Redis에 저장된 값이 있는지 확인
      const cachedData = await client.get(`keyword:${keyword}`);

      // 1-1. Redis에 저장된 값이 있을 때, Redis에서 값을 가져온다.
      if (cachedData) {
        // Redis에 저장된 데이터를 JSON으로 변환해서 반환
        console.log('Redis Cache에서 읽어옴');
        return JSON.parse(cachedData);
      }

      // 2. Redis에 없을 시 API 실행
      // Redis에 저장된 값이 없으면 API 요청
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }
      console.log('API 실행해서 읽어옴');
      const result = await response.json();

      // 2-1. API 실행 후 해당 데이터 저장
      // Redis에 저장할 데이터를 가공
      const itemsToStore = result.items.map((item) => ({
        keyword, // 검색 키워드 추가
        title: item.title,
        image: item.image,
        lprice: item.lprice,
        mallName: item.mallName,
        link: item.link,
      }));

      // Redis에 저장 (키는 keyword와 연관)
      // TTL 24시간(3600초 * 24)
      await client.set(`keyword:${keyword}`, JSON.stringify(itemsToStore), 'EX', 3600 * 24);

      return result.items;
    } catch (error) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
  }
}