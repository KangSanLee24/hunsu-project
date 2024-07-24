import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ForbiddenException } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';

@UseGuards(JwtStrategy)
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
  async createRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @LogIn() user: User, @Body() createRecommentDto: CreateRecommentDto) {
    return await this.recommentService.createRecomment(+postId, +commentId, user, createRecommentDto);
  }

  /**
   * 대댓글 수정
   * @param createRecommentDto
   * @returns
   */
  @Patch(':postId/comments/:commentId/recomments/:recommentId')
  async updateRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @Param('recommentId') recommentId: number, @LogIn() user: User, @Body() createRecommentDto: CreateRecommentDto) {
    const recomment = await this.recommentService.findRecomment(recommentId);

    if(recomment.user.id != user.id) {
      throw new ForbiddenException(
        '작성자가 아닙니다.'
      )
    };

    return await this.recommentService.updateRecomment(+postId, +commentId, +recommentId, createRecommentDto);
  }

  /**
   * 대댓글 삭제
   * @returns
   */
  @Delete(':postId/comments/:commentsId/recomments/:recommentId')
  async removeRecomment(@Param('postId') postId: number, @Param('commentId') commentId: number, @Param('recommentId') recommentId: number, @LogIn() user: User, ) {
    const recomment = await this.recommentService.findRecomment(recommentId);

    if(recomment.user.id != user.id) {
      throw new ForbiddenException(
        '작성자가 아닙니다.'
      )
    };

    return await this.recommentService.removeRecomment(+postId, +commentId, +recommentId);
  }
}
