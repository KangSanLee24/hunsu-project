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

  /** 대댓글 찾기 **/
  async findRecomment(recommentId: number) {
    // 1. 대댓글이 존재하는지 확인
    const findRecomment = await this.commentRepository.findOne({
      where: { id: recommentId },
    });
    if (!findRecomment) {
      throw new NotFoundException('해당 대댓글이 없습니다.');
    }

    return findRecomment;
  }

  /** 대댓글 생성 **/
  async createRecomment(
    commentId: number,
    user: User,
    createRecommentDto: CreateRecommentDto
  ) {
    // 1. 해당 댓글이 존재하는지 확인 ( parentId = NULL 이여야 댓글 )
    const findComment = await this.commentRepository.findOne({
      where: { id: commentId, parentId: IsNull() },
    });

    if (!findComment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    // 2. 대댓글 저장
    const newRecomment = await this.commentRepository.save({
      parentId: commentId, // 부모댓글 id
      postId: findComment.postId, // 부모댓글이 달려있는 게시글 id
      userId: user.id, // 대댓글을 쓴 사람 id
      content: createRecommentDto.content, // 대댓글 내용
    });

    // 3. 댓글 작성 포인트 지급
    const isValidPoint = await this.pointService.validatePointLog(
      user.id,
      PointType.COMMENT
    );
    if (isValidPoint)
      this.pointService.savePointLog(user.id, PointType.COMMENT, true);

    // 4. 알람을 줄 것인가 여부
    // 부모댓글을 쓴 사람이 사용자인지 확인
    if (user.id !== findComment.userId) {
      await this.alarmService.createAlarm(
        findComment.userId, // 부모댓글을 쓴 사용자 id
        AlarmFromType.COMMENT, // 유형은 COMMENT
        newRecomment.parentId // 어떤 댓글에(commentId) 새로운 대댓글이 달렸는지
      );
    }

    return newRecomment;
  }

  /** 대댓글 목록 조회 **/
  async findRecommentsById(commentId: number) {
    // 1. commentId로 대댓글을 확인
    const recomments = await this.commentRepository.find({
      where: { parentId: commentId },
      relations: ['user', 'commentLikes', 'commentDislikes'],
      select: {
        user: {
          nickname: true,
        },
      },
    });

    // 2. 응답 형태 수정
    return recomments.map((recomment) => ({
      id: recomment.id,
      parentId: recomment.parentId,
      content: recomment.content,
      userId: recomment.userId,
      nickname: recomment.user?.nickname,
      postId: recomment.postId,
      createdAt: recomment.createdAt,
      updateAt: recomment.updateAt,
      likes: recomment.commentLikes.length,
      dislikes: recomment.commentDislikes.length,
    }));
  }

  /** 대댓글 수정 **/
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

  /**대댓글 삭제**/
  async removeRecomment(userId, commentId: number, recommentId: number) {
    const removeRecomment = await this.commentRepository.delete({
      id: recommentId,
    });

    // 댓글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.POST, false);

    return removeRecomment;
  }
}
