import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CommentLike } from 'src/like/entities/comment-like.entity';
import { CommentDislike } from 'src/dislike/entities/comment-dislike.entity';
import { Role } from 'src/user/types/user-role.type';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { AlarmService } from 'src/alarm/alarm.service';
import { AlarmFromType } from 'src/alarm/types/alarm-from.type';
import { PointService } from 'src/point/point.service';
import { PointType } from 'src/point/types/point.type';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    private readonly alarmService: AlarmService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(CommentDislike)
    private commentDislikeRepository: Repository<CommentDislike>,
    private readonly pointService: PointService
  ) {}

  // 댓글 생성
  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({
      id: postId,
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    // 권한 확인
    if (!user) {
      throw new UnauthorizedException(COMMENT_MESSAGE.COMMENT.UNAUTHORIZED);
    }

    // 게시글 확인
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }

    const data = await this.commentRepository.save({
      userId,
      postId,
      ...createCommentDto,
    });
    const nickname = user.nickname;

    // 댓글 생성 포인트 지급
    const isValidPoint = await this.pointService.validatePointLog(
      userId,
      PointType.COMMENT
    );
    if (isValidPoint) {
      console.log('postId 전달:', postId); // 디버깅용 로그
      this.pointService.savePointLog(userId, PointType.COMMENT, true, postId);
    }

    // 알람을 줄 것인지 여부
    // 댓글을 다는 사람(로그인한 사람)이 게시글을 쓴 사람이 아닌 경우에만 알람

    if (userId !== post.userId) {
      await this.alarmService.createAlarm(
        post.userId, // 게시글 글쓴이(알람을 받을 사용자)에게
        AlarmFromType.POST, // 유형은 POST
        post.id // 어떤 게시글에(postId) 새로운 댓글이 달렸는지
      );
    }

    // 응답 데이터 구성
    return {
      id: data.id,
      userId: data.userId,
      nickName: nickname,
      postId: data.postId,
      parentId: data.parentId,
      content: data.content,
      createdAt: data.createdAt,
      updateAt: data.updateAt,
    };
  }

  // 댓글 목록 조회 API
  async findCommentsByPostId(postId: number) {
    // comments
    const comments = await this.commentRepository.find({
      where: { postId, parentId: IsNull() },
    });

    // recomments, user nickname, likes, dislikes
    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const recomments = await this.commentRepository.find({
          where: { postId, parentId: comment.id },
        });

        const user = await this.userRepository.findOne({
          where: { id: comment.userId },
          select: ['nickname'],
        });

        const likes = await this.commentLikeRepository.count({
          where: { commentId: comment.id },
        });
        const dislikes = await this.commentDislikeRepository.count({
          where: { commentId: comment.id },
        });

        const recommentsWithDetails = await Promise.all(
          recomments.map(async (recomment) => {
            const recommentUser = await this.userRepository.findOne({
              where: { id: recomment.userId },
              select: ['nickname'],
            });

            const recommentLikes = await this.commentLikeRepository.count({
              where: { commentId: recomment.id },
            });
            const recommentDislikes = await this.commentDislikeRepository.count(
              {
                where: { commentId: recomment.id },
              }
            );

            return {
              ...recomment,
              nickname: recommentUser?.nickname,
              likes: recommentLikes,
              dislikes: recommentDislikes,
            };
          })
        );

        return {
          ...comment,
          nickname: user?.nickname,
          likes,
          dislikes,
          recomments: recommentsWithDetails,
        };
      })
    );

    return commentsWithDetails;
  }

  async findOneBy(id: number) {
    return await this.commentRepository.findOneBy({ id });
  }

  /** 댓글 수정**/
  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });
    const comment = await this.commentRepository.findOneBy({ id: commentId });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    else if (comment.userId !== userId) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.UPDATE.FAILURE.FORBIDDEN
      );
    }

    const updatedComment = await this.commentRepository.save({
      id: commentId,
      ...updateCommentDto,
    });
    return updatedComment;
  }

  /** 댓글 삭제 **/
  async remove(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOneBy({
      id: commentId,
    });

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    else if (comment.userId !== userId) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.DELETE.FAILURE.FORBIDDEN
      );
    }

    // 댓글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.COMMENT, false);

    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }

  /** 댓글 강제 삭제 **/
  async forceRemove(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // user의 역할이 admin인지 확인
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.FORCE_DELETE.FAILURE.FORBIDDEN
      );
    }

    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }
}
