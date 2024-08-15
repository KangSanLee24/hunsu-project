import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';

@ApiTags('05. RECOMMENT API')
@Controller('comments')
export class RecommentController {
  constructor(private readonly recommentService: RecommentService) {}

  /** 대댓글 생성 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '1. 대댓글 생성 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post(':commentId/recomments')
  async createRecomment(
    @Param('commentId') commentId: number,
    @LogIn() user: User,
    @Body() createRecommentDto: CreateRecommentDto
  ) {
    const data = await this.recommentService.createRecomment(
      +commentId,
      user,
      createRecommentDto
    );
    return {
      status: HttpStatus.OK,
      message: '대댓글이 생성되었습니다.',
      data: data,
    };
  }

  /** 대댓글 목록 조회 **/
  @ApiOperation({ summary: '2. 대댓글 목록 조회 API' })
  @Get(':commentId/recomments')
  async findAll(@Param('commentId') commentId: number) {
    const data = await this.recommentService.findRecommentsById(commentId);
    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.READ.SUCCESS,
      data: data,
    };
  }

  /** 대댓글 수정 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '3. 대댓글 수정 API' })
  @Patch(':commentId/recomments/:recommentId')
  async updateRecomment(
    @Param('commentId') commentId: number,
    @Param('recommentId') recommentId: number,
    @LogIn() user: User,
    @Body() createRecommentDto: CreateRecommentDto
  ) {
    // 1. 대댓글 존재하는지 확인 + 사용자가 작성자인지 확인
    const recomment = await this.recommentService.findRecomment(recommentId);

    if (recomment.userId != user.id) {
      throw new ForbiddenException('작성자가 아닙니다.');
    }

    const data = await this.recommentService.updateRecomment(
      +commentId,
      +recommentId,
      createRecommentDto
    );

    return {
      status: HttpStatus.OK,
      message: '대댓글이 수정되었습니다.',
      data: data,
    };
  }

  /** 대댓글 삭제 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4. 대댓글 삭제 API' })
  @Delete(':commentsId/recomments/:recommentId')
  async removeRecomment(
    @Param('commentId') commentId: number,
    @Param('recommentId') recommentId: number,
    @LogIn() user: User
  ) {
    // 1. 대댓글 존재하는지 확인 + 사용자가 작성자인지 확인
    const recomment = await this.recommentService.findRecomment(recommentId);

    if (recomment.userId != user.id) {
      throw new ForbiddenException('작성자가 아닙니다.');
    }

    const data = await this.recommentService.removeRecomment(
      user.id,
      +commentId,
      +recommentId
    );
    return {
      status: HttpStatus.OK,
      message: '대댓글이 삭제되었습니다.',
      data: data,
    };
  }
}
