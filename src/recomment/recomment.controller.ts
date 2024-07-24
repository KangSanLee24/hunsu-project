import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('recomments')
@Controller('posts')
export class RecommentController {
  constructor(private readonly recommentService: RecommentService) {}

  /**
   * 대댓글 생성
   * @param createRecommentDto
   * @returns
   */
  @Post(':postId/comments/:commentId/recomments')
  async createRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @Body() createRecommentDto: CreateRecommentDto) {
    return await this.recommentService.createRecomment(+postId, +commentId, createRecommentDto);
  }

  /**
   * 대댓글 수정
   * @param createRecommentDto
   * @returns
   */
  @Patch(':postId/comments/:commentId/recomments/:recommentId')
  async updateRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @Param('recommentId') recommentId: number, @Body() createRecommentDto: CreateRecommentDto) {
    return await this.recommentService.updateRecomment(+postId, +commentId, +recommentId, createRecommentDto);
  }

  /**
   * 대댓글 삭제
   * @returns
   */
  @Delete(':postId/comments/:commentsId/recomments/:recommentId')
  async removeRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @Param('recommentId') recommentId: number) {
    return await this.recommentService.removeRecomment(+postId, +commentId, +recommentId);
  }
}
