import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@Controller('')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiTags('4. COMMENT API')
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

  @ApiTags('4. COMMENT API')
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

  @ApiTags('4. COMMENT API')
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

  /** 게시글 좋아요 조회 API **/
  @ApiTags('3. POST API')
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

  /** 로그인한 사람의 게시글 좋아요 조회 API **/
  @ApiTags('3. POST API')
  @ApiOperation({ summary: '나의 게시글 좋아요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/posts/:postId/likes/me')
  async getMyPostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.likeService.getMyPostLike(userId, postId);
    return {
      status: HttpStatus.OK,
      messgae: '나의 게시글 좋아요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 게시글 좋아요 클릭 API **/
  @ApiTags('3. POST API')
  @ApiOperation({ summary: '게시글 좋아요 생성 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('/posts/:postId/likes')
  async postLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.likeService.postLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.CREATE.SUCCESS,
    };
  }
}
