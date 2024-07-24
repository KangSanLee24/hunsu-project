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
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

@ApiTags('댓글 API')
@Controller('/posts/:postId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 댓글 생성
   * @param createCommentDto
   * @returns
   */
  @ApiOperation({ summary: '댓글 생성 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post()
  async create(@Body() createCommentDto: CreateCommentDto) {
    // @LogIn() user: User, @Param('postId', ParseIntPipe) postId: number,
    // const userId = user.id;
    const userId = 1;
    const postId = 1;
    const data = await this.commentService.createComment(userId, postId, createCommentDto);

    return {
      status: HttpStatus.CREATED,
      message: '댓글 생성에 성공하셨습니다.',
      data,
    };
  }

  /**
   * 댓글 목록 조회
   * @returns
   */
  @ApiOperation({ summary: '댓글 목록 조회 API' })
  @Get()
  async findAll(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.commentService.findCommentsByPostId(postId);
    return {
      status: HttpStatus.OK,
      message: '댓글 목록 조회에 성공하셨습니다.',
      data,
    };
  }

  /**
   * 댓글 수정
   * @param id
   * @param updateCommentDto
   * @returns
   */
  @ApiOperation({ summary: '댓글 수정 API' })
  @Patch(':commentId')
  async update(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    // @LogIn() user: User, @Param('postId', ParseIntPipe) postId: number,
    // const userId = user.id;
    const userId = 1;
    const postId = 1;

    const data = await this.commentService.update(userId, postId, commentId, updateCommentDto);

    return {
      status: HttpStatus.OK,
      message: '댓글이 수정되었습니다.',
      data,
    };
  }

  /**
   * 댓글 삭제
   * @param id
   * @returns
   */
  @ApiOperation({ summary: '댓글 삭제 API' })
  @Delete(':commentId')
  async remove(@Param('commentId', ParseIntPipe) commentId: number) {
    // @LogIn() user: User, @Param('postId', ParseIntPipe) postId: number,
    // const userId = user.id;
    const userId = 1;
    await this.commentService.remove(userId, commentId);

    return {
      status: HttpStatus.OK,
      message: '댓글 삭제에 성공했습니다.',
    };
  }
}
