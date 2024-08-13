import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('10. 해시태그 API')
@Controller('hashtags')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

  /**
   * 해시태그 랭킹 조회
   * @returns
   */
  @Get('ranks-weekly')
  async hashtagWeeklyLank() {
    const data = await this.hashtagService.hashtagWeeklyLank();
    return data;
  }
}
