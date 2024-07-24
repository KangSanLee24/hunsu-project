import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('좋아요 API')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
@Controller('/posts/:postId')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({ summary: '댓글 좋아요 조회 API' })
  @Get('/comments/:commentId/likes')
  async getCommentLikes(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    const data = await this.likeService.getCommentLikes(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: `댓글 좋아요 조회에 성공했습니다.`,
      data,
    };
  }

  @ApiOperation({ summary: '댓글 좋아요 생성 API' })
  @Post('/comments/:commentId/likes')
  async createCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.likeService.createCommentLike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: '댓글 좋아요 생성에 성공했습니다.',
    };
  }

  @ApiOperation({ summary: '댓글 좋아요 삭제 API' })
  @Delete('/comments/:commentId/likes')
  async deleteCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.likeService.deleteCommentLike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: '댓글 좋아요 삭제에 성공했습니다.',
    };
  }

  @ApiOperation({ summary: '게시글 좋아요 조회 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Get('/likes')
  async getPostLikes(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.likeService.getPostLikes(userId, postId);

    return {
      status: HttpStatus.OK,
      message: '게시글 좋아요 조회에 성공했습니다.',
      data,
    };
  }

  @ApiOperation({ summary: '게시글 좋아요 생성 API' })
  @Post('/likes')
  async createPostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.likeService.createPostLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: '게시글 좋아요 생성에 성공했습니다.',
      data,
    };
  }

  @ApiOperation({ summary: '게시글 좋아요 삭제 API' })
  @Delete('/likes')
  async deletePostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.likeService.deletePostLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: '게시글 좋아요 삭제에 성공했습니다.',
      data,
    };
  }
}
