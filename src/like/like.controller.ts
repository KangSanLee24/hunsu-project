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
  ApiTags,
} from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@Controller('')
export class LikeController {
  constructor(private readonly likeService: LikeService) { }

  @ApiTags('댓글 API')
  @ApiOperation({ summary: '댓글 좋아요 조회 API' })
  @Get('/comments/:commentId/likes')
  async getCommentLikes(@Param('commentId', ParseIntPipe) commentId: number) {
    const data = await this.likeService.getCommentLikes(commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.LIKE.FIND.SUCCESS,
      data,
    };
  }

  @ApiTags('댓글 API')
  @ApiOperation({ summary: '댓글 좋아요 생성 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/comments/:commentId/likes')
  async createCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.likeService.createCommentLike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.LIKE.CREATE.SUCCESS,
    };
  }

  @ApiTags('댓글 API')
  @ApiOperation({ summary: '댓글 좋아요 삭제 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/comments/:commentId/likes')
  async deleteCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.likeService.deleteCommentLike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.LIKE.DELETE.SUCCESS,
    };
  }

  @ApiTags('게시글 API')
  @ApiOperation({ summary: '게시글 좋아요 조회 API' })
  @Get('/posts/:postId/likes')
  async getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.likeService.getPostLikes(postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.FIND.SUCCESS,
      data,
    };
  }

  @ApiTags('게시글 API')
  @ApiOperation({ summary: '게시글 좋아요 생성 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/posts/:postId/likes')
  async createPostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.likeService.createPostLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.CREATE.SUCCESS,
    };
  }

  @ApiTags('게시글 API')
  @ApiOperation({ summary: '게시글 좋아요 삭제 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/posts/:postId/likes')
  async deletePostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.likeService.deletePostLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.DELETE.SUCCESS,
    };
  }
}
