import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { AlarmService } from 'src/alarm/alarm.service';
import { AlarmFromType } from 'src/alarm/types/alarm-from.type';
import { PointService } from 'src/point/point.service';
import { PointType } from 'src/point/types/point.type';

@Injectable()
export class RecommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,

    private readonly alarmService: AlarmService,
    private readonly pointService: PointService
  ) {}

  //대댓글 찾기
  async findRecomment(recommentId: number) {
    const findRecomment = await this.commentRepository.findOne({
      where: { id: recommentId },
    });

    if (!findRecomment) {
      throw new NotFoundException('해당 대댓글이 없습니다.');
    }

    return findRecomment;
  }

  //대댓글 생성
  async createRecomment(
    commentId: number,
    user: User,
    createRecommentDto: CreateRecommentDto
  ) {
    // 댓글에 대댓글에 대댓글이 가능해서 수정.
    const findPost = await this.commentRepository.findOne({
      where: { id: commentId, parentId: IsNull() },
    });

    if (!findPost) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    const newRecomment = await this.commentRepository.save({
      parentId: commentId,
      postId: findPost.postId,
      userId: user.id,
      content: createRecommentDto.content,
    });

    // 댓글 생성 포인트 지급
    const isValidPoint = await this.pointService.validatePointLog(
      user.id,
      PointType.COMMENT
    );
    if (isValidPoint)
      this.pointService.savePointLog(user.id, PointType.COMMENT, true);

    await this.alarmService.createAlarm(
      findPost.userId, // 댓글 글쓴이에게
      AlarmFromType.COMMENT, // 유형은 COMMENT
      newRecomment.parentId // commentId 댓글에 새로운 대댓글이 달렸다고 전달
    );

    return newRecomment;
  }

  //대댓글 수정
  async updateRecomment(
    commentId: number,
    recommentId: number,
    createRecommentDto: CreateRecommentDto
  ) {
    const updateRecomment = await this.commentRepository.update(
      { id: recommentId },
      { content: createRecommentDto.content }
    );

    return updateRecomment;
  }

  //대댓글 삭제
  async removeRecomment(userId, commentId: number, recommentId: number) {
    const removeRecomment = await this.commentRepository.delete({
      id: recommentId,
    });

    // 댓글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.POST, false);

    return removeRecomment;
  }
}
