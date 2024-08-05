import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('해시태그 API')
@Controller('hashtag')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

/**
 * 해시태그 랭킹 조회
 * @returns
 */
  @Get('ranks')
  async hashtagLank(@Query('num') num: number) {
    return await this.hashtagService.hashtagLank(+num);
  }
}

