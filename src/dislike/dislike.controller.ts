import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { DislikeService } from './dislike.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { CreateDislikeDto } from './dtos/create-dislike.dto';
import { UpdateDislikeDto } from './dtos/update-dislike.dto';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@Controller('')
export class DislikeController {
  constructor(private readonly dislikeService: DislikeService) {}

  @ApiTags('4. COMMENT API')
  @ApiOperation({ summary: '댓글 싫어요 조회 API' })
  @Get('/comments/:commentId/dislikes')
  async getCommentDislikes(
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const data = await this.dislikeService.getCommentDislikes(commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.DISLIKE.FIND.SUCCESS,
      data,
    };
  }

  @ApiTags('4. COMMENT API')
  @ApiOperation({ summary: '댓글 싫어요 생성 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/comments/:commentId/dislikes')
  async createCommentDislike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.dislikeService.createCommentDislike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.DISLIKE.CREATE.SUCCESS,
    };
  }

  @ApiTags('4. COMMENT API')
  @ApiOperation({ summary: '댓글 싫어요 삭제 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/comments/:commentId/dislikes')
  async deleteCommentDislike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.dislikeService.deleteCommentDislike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.DISLIKE.DELETE.SUCCESS,
    };
  }

  /** 게시글 싫어요 조회 API **/
  @ApiTags('3. POST API')
  @ApiOperation({ summary: '게시글 싫어요 조회 API' })
  @Get('/posts/:postId/dislikes')
  async getPostDislikes(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.dislikeService.getPostDislikes(postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.FIND.SUCCESS,
      data,
    };
  }

  /** 로그인한 사람의 게시글 싫어요 조회 API **/
  @ApiTags('3. POST API')
  @ApiOperation({ summary: '나의 게시글 싫어요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('/posts/:postId/dislikes/me')
  async getMyPostDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.dislikeService.getMyPostDislike(userId, postId);
    return {
      status: HttpStatus.OK,
      messgae: '나의 게시글 싫어요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 게시글 싫어요 클릭 API **/
  @ApiTags('3. POST API')
  @ApiOperation({ summary: '게시글 싫어요 클릭 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch('/posts/:postId/dislikes')
  async postDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.dislikeService.postDislike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.CREATE.SUCCESS,
    };
  }
}
