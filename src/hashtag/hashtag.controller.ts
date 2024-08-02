import { Controller, Get, UseGuards } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

// @UseGuards(AuthGuard('jwt'))
@ApiTags('해시태그 API')
@Controller('hashtag')
export class HashtagController {
  constructor(private readonly hashtagService: HashtagService) {}

/**
 * 해시태그 카운트 계산
 * @returns
 */
  @Get('counts')
  async hashtagCount() {
    return await this.hashtagService.hashtagCount();
  }
}

