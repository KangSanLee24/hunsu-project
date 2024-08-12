import {
  BadRequestException,
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
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { CommentDislike } from 'src/comment/entities/comment-dislike.entity';
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

  /** 댓글 좋아요 조회 API **/
  async getCommentLikes(commentId: number) {
    // 1. 댓글이 존재하니?
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 총 댓글 좋아요 카운트
    const count = await this.commentLikeRepository.countBy({ commentId });
    return count;
  }

  /** 로그인한 사람의 댓글 좋아요 조회 API **/
  async getMyCommentLike(userId: number, commentId: number) {
    // 1. 댓글이 존재하는지?
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 해당 댓글에 좋아요를 눌렀는지?
    const like = await this.commentLikeRepository.findOneBy({
      userId,
      commentId,
    });

    return like ? true : false;
  }

  /** 댓글 좋아요 클릭 API **/
  async clickCommentLike(userId: number, commentId: number) {
    // 1. 좋아요를 누를 댓글 정보
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 댓글이 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }
    // 1-2. 본인의 댓글에는 좋아요를 누를 수 없도록
    if (existingComment.userId === userId) {
      throw new BadRequestException(COMMENT_MESSAGE.LIKE.CLICK.FAILURE.NO_SELF);
    }

    // 2. 내가 싫어요를 누른 상태인지 아닌지 확인
    const alreadyDislike = await this.commentDislikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });
    // 2-1. 싫어요를 누른 상태라면 좋아요를 누를 수 없도록
    if (alreadyDislike) {
      throw new BadRequestException(
        COMMENT_MESSAGE.LIKE.CLICK.FAILURE.ALREADY_DISLIKE
      );
    }

    // 3. 내가 좋아요를 누른 상태인지 아닌지 확인
    const commentLike = await this.commentLikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });
    if (!commentLike) {
      // 3-1A. 댓글 좋아요 명단에 내가 없다면 => 댓글 좋아요 등록
      await this.commentLikeRepository.save({
        userId,
        commentId,
      });
      // 3-1B. 댓글 좋아요에 따른 포인트 지급
      const isValidPoint = await this.pointService.validatePointLog(
        userId,
        PointType.COMMENT_LIKE
      );
      if (isValidPoint) {
        this.pointService.savePointLog(userId, PointType.COMMENT_LIKE, true);
      }
    } else {
      // 3-2A. 댓글 좋아요 명단에 내가 있다면 => 댓글 좋아요 취소
      await this.commentLikeRepository.delete({
        userId,
        commentId,
      });
      // 3-2B. 댓글 좋아요 취소에 따른 포인트 차감
      this.pointService.savePointLog(userId, PointType.COMMENT_LIKE, false);
    }
  }

  /** 댓글 싫어요 조회 API **/
  async getCommentDislikes(commentId: number) {
    // 1. 댓글이 존재하니?
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 총 댓글 싫어요 카운트
    const count = await this.commentDislikeRepository.countBy({ commentId });
    return count;
  }

  /** 로그인한 사람의 댓글 싫어요 조회 API **/
  async getMyCommentDislike(userId: number, commentId: number) {
    // 1. 댓글이 존재하는지?
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 해당 댓글에 싫어요를 눌렀는지?
    const dislike = await this.commentDislikeRepository.findOneBy({
      userId,
      commentId,
    });

    return dislike ? true : false;
  }

  /** 댓글 싫어요 클릭 API **/
  async clickCommentDislike(userId: number, commentId: number) {
    // 1. 싫어요를 누를 댓글 정보
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    // 1-1. 댓글이 존재하지 않으면 에러처리
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }
    // 1-2. 본인의 댓글에는 싫어요를 누를 수 없도록
    if (existingComment.userId == userId) {
      throw new BadRequestException(
        COMMENT_MESSAGE.DISLIKE.CLICK.FAILURE.NO_SELF
      );
    }

    // 2. 내가 좋아요를 누른 상태인지 아닌지 확인
    const alreadyLike = await this.commentLikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });
    // 2-1. 좋아요를 누른 상태라면 싫어요를 누를 수 없도록
    if (alreadyLike) {
      throw new BadRequestException(
        COMMENT_MESSAGE.DISLIKE.CLICK.FAILURE.ALREADY_LIKE
      );
    }

    // 3. 내가 싫어요를 누른 상태인지 아닌지 확인
    const commentDislike = await this.commentDislikeRepository.findOneBy({
      userId,
      commentId,
    });
    if (!commentDislike) {
      // 3-1. 댓글 싫어요 명단에 내가 없다면 => 댓글 싫어요 등록
      await this.commentDislikeRepository.save({
        userId,
        commentId,
      });
    } else {
      // 3-2. 댓글 싫어요 명단에 내가 있다면 => 댓글 싫어요 취소
      await this.commentDislikeRepository.delete({
        userId,
        commentId,
      });
    }
  }
}
