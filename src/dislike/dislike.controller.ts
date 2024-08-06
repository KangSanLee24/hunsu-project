import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
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

  @ApiTags('3. POST API')
  @ApiOperation({ summary: '게시글 싫어요 생성 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/posts/:postId/dislikes')
  async createPostDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.dislikeService.createPostDislike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.CREATE.SUCCESS,
    };
  }

  @ApiTags('3. POST API')
  @ApiOperation({ summary: '게시글 싫어요 삭제 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('/posts/:postId/dislikes')
  async deletePostDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.dislikeService.deletePostDislike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.DELETE.SUCCESS,
    };
  }

  // @Get()
  // findAll() {
  //   return this.dislikeService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.dislikeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDislikeDto: UpdateDislikeDto) {
  //   return this.dislikeService.update(+id, updateDislikeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.dislikeService.remove(+id);
  // }
}
