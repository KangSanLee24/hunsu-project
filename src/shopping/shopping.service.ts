import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShoppingService {
  private readonly CLIENT_ID: string;
  private readonly CLIENT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.CLIENT_ID = this.configService.get<string>('CLIENTID');
    this.CLIENT_SECRET = this.configService.get<string>('CLIENTSECRET');
  }

  /* 네이버 쇼핑 API 상품 검색 */
  async search(keyword: string) {
    const url = `https://openapi.naver.com/v1/search/shop.json?query=${keyword}`;
    const headers = {
      'X-Naver-Client-Id': this.CLIENT_ID,
      'X-Naver-Client-Secret': this.CLIENT_SECRET,
    };

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new NotFoundException('상품을 찾을 수 없습니다.');
      }
      const result = await response.json();
      return result.items;
    } catch (error) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
  }
}