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
  async hashtagWeeklyLank(@Query('num') num: number) {
    const data = await this.hashtagService.hashtagWeeklyLank(+num);
    return {
      status: 200,
      message: '해시태그 랭킹이 조회되었습니다.',
      data: data,
    };
  }
}
