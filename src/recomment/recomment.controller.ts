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

@UseGuards(AuthGuard('jwt'))
@ApiTags('대댓글 API')
@ApiBearerAuth()
@Controller('comments')
export class RecommentController {
  constructor(private readonly recommentService: RecommentService) {}

  /** 대댓글 생성 **/
  @ApiOperation({ summary: '대댓글 생성 API' })
  @ApiResponse({ status: HttpStatus.CREATED })
  @Post(':commentId/recomments')
  async createRecomment(
    @Param('commentId') commentId: number,
    @LogIn() user: User,
    @Body() createRecommentDto: CreateRecommentDto
  ) {
    return await this.recommentService.createRecomment(
      +commentId,
      user,
      createRecommentDto
    );
  }

  /** 대댓글 수정 **/
  @ApiOperation({ summary: '대댓글 수정 API' })
  @Patch(':commentId/recomments/:recommentId')
  async updateRecomment(
    @Param('commentId') commentId: number,
    @Param('recommentId') recommentId: number,
    @LogIn() user: User,
    @Body() createRecommentDto: CreateRecommentDto
  ) {
    const recomment = await this.recommentService.findRecomment(recommentId);

    if (recomment.userId != user.id) {
      throw new ForbiddenException('작성자가 아닙니다.');
    }

    return await this.recommentService.updateRecomment(
      +commentId,
      +recommentId,
      createRecommentDto
    );
  }

  /** 대댓글 삭제 **/
  @ApiOperation({ summary: '대댓글 삭제 API' })
  @Delete(':commentsId/recomments/:recommentId')
  async removeRecomment(
    @Param('commentId') commentId: number,
    @Param('recommentId') recommentId: number,
    @LogIn() user: User
  ) {
    const recomment = await this.recommentService.findRecomment(recommentId);

    if (recomment.userId != user.id) {
      throw new ForbiddenException('작성자가 아닙니다.');
    }

    return await this.recommentService.removeRecomment(
      +commentId,
      +recommentId
    );
  }
}
