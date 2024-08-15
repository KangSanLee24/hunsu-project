import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';
import { AuthGuard } from '@nestjs/passport';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';

@ApiTags('04. COMMENT API')
@Controller('/posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /** 댓글 생성 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '1. 댓글 생성 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post()
  async create(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() createCommentDto: CreateCommentDto
  ) {
    const userId = user.id;

    const data = await this.commentService.createComment(
      userId,
      postId,
      createCommentDto
    );

    return {
      status: HttpStatus.CREATED,
      message: COMMENT_MESSAGE.COMMENT.CREATE.SUCCESS,
      data,
    };
  }

  /** 댓글 목록 조회 **/
  @ApiOperation({ summary: '2. 댓글 목록 조회 API' })
  @Get()
  async findAll(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.commentService.findCommentsById(postId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.READ.SUCCESS,
      data,
    };
  }

  /** 댓글 수정**/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '3. 댓글 수정 API' })
  @Patch(':commentId')
  async update(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const userId = user.id;

    const data = await this.commentService.update(
      userId,
      postId,
      commentId,
      updateCommentDto
    );

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.UPDATE.SUCCESS,
      data,
    };
  }

  /** 댓글 삭제 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4. 댓글 삭제 API' })
  @Delete(':commentId')
  async remove(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.remove(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.DELETE.SUCCESS,
    };
  }

  /** 댓글 강제 삭제 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '댓글 강제 삭제 API' })
  @Delete(':commentId/admin')
  async forceRemove(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.remove(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.FORCE_DELETE.SUCCESS,
    };
  }

  /** 댓글 좋아요 조회 API **/
  @ApiOperation({ summary: '댓글 좋아요 조회 API' })
  @Get(':commentId/likes')
  async getCommentLikes(@Param('commentId', ParseIntPipe) commentId: number) {
    const data = await this.commentService.getCommentLikes(commentId);
    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.LIKE.FIND.SUCCESS,
      data,
    };
  }

  /** 로그인한 사람의 댓글 좋아요 여부 조회 API **/
  @ApiOperation({ summary: '나의 댓글 좋아요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':commentId/likes/me')
  async getMyCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    const data = await this.commentService.getMyCommentLike(userId, commentId);
    return {
      status: HttpStatus.OK,
      message: '나의 댓글 좋아요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 댓글 좋아요 클릭 API **/
  @ApiOperation({ summary: '댓글 좋아요 클릭 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':commentId/likes')
  async clickCommentLike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.clickCommentLike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.LIKE.CLICK.SUCCESS,
    };
  }

  /** 댓글 싫어요 조회 API **/
  @ApiOperation({ summary: '댓글 싫어요 조회 API' })
  @Get(':commentId/dislikes')
  async getCommentDislikes(
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const data = await this.commentService.getCommentDislikes(commentId);
    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.DISLIKE.FIND.SUCCESS,
      data,
    };
  }

  /** 로그인한 사람의 댓글 싫어요 여부 조회 API **/
  @ApiOperation({ summary: '나의 댓글 싫어요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':commentId/dislikes/me')
  async getMyCommentDislike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    const data = await this.commentService.getMyCommentDislike(
      userId,
      commentId
    );
    return {
      status: HttpStatus.OK,
      message: '나의 댓글 싫어요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 댓글 싫어요 클릭 API **/
  @ApiOperation({ summary: '댓글 싫어요 클릭 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':commentId/dislikes')
  async clickCommentDislike(
    @LogIn() user: User,
    @Param('commentId', ParseIntPipe) commentId: number
  ) {
    const userId = user.id;
    await this.commentService.clickCommentDislike(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.DISLIKE.CLICK.SUCCESS,
    };
  }
}
