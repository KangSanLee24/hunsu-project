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

  /** 댓글 생성 **/
  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto
  ) {
    // 1. 사용자 정보 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });
    if (!user) {
      throw new UnauthorizedException(COMMENT_MESSAGE.COMMENT.UNAUTHORIZED);
    }

    // 2. 게시글 존재 확인
    const post = await this.postRepository.findOneBy({
      id: postId,
    });
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }
    // 닉네임 저장
    const nickname = user.nickname;

    // 3. 댓글 저장
    const data = await this.commentRepository.save({
      userId,
      postId,
      ...createCommentDto,
    });

    // 4. 댓글 생성 포인트 확인
    const isValidPoint = await this.pointService.validatePointLog(
      userId,
      PointType.COMMENT
    );
    // 4-1. 포인트 획득 가능하고 게시글 작성자가 아닐 때, 댓글 생성 포인트 지급
    if (isValidPoint && post.userId !== userId) {
      console.log('postId 전달:', postId); // 디버깅용 로그
      this.pointService.savePointLog(userId, PointType.COMMENT, true);
    }

    // 5. 알람(SSE) 전송
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

  /** 댓글 목록 조회 API ( 댓글만 ) **/
  async findCommentsById(postId: number) {
    // 1. 댓글 목록 조회
    const comments = await this.commentRepository.find({
      where: { postId, parentId: IsNull() },
      relations: ['user', 'commentLikes', 'commentDislikes'],
      select: {
        user: {
          nickname: true,
        },
      },
    });

    // 2. 각 댓글에 대한 대댓글 갯수 추가
    const commentsWithRecommentsCount = await Promise.all(
      comments.map(async (comment) => {
        const recommentsCount = await this.commentRepository.count({
          where: { parentId: comment.id },
        });

        return {
          id: comment.id,
          parentId: comment.parentId,
          content: comment.content,
          userId: comment.userId,
          postId: comment.postId,
          createdAt: comment.createdAt,
          updateAt: comment.updateAt,
          nickname: comment.user?.nickname,
          likes: comment.commentLikes.length,
          dislikes: comment.commentDislikes.length,
          recommentsCount,
        };
      })
    );

    return commentsWithRecommentsCount;
  }

  /** 댓글 수정**/
  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    // 1. 게시글이 존재하는지 확인
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }

    // 2. 댓글이 존재하는지 확인 + 작성자 본인인지 확인
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    } else if (comment.userId !== userId) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.UPDATE.FAILURE.FORBIDDEN
      );
    }

    // 3. 수정 내용 저장
    const updatedComment = await this.commentRepository.save({
      id: commentId,
      ...updateCommentDto,
    });
    return updatedComment;
  }

  /** 댓글 삭제 **/
  async remove(userId: number, commentId: number) {
    // 1. 댓글이 존재하는지 확인, 작성자 본인인지 확인
    const comment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    } else if (comment.userId !== userId) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.DELETE.FAILURE.FORBIDDEN
      );
    }

    // 2. 댓글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.COMMENT, false);

    // 3. 댓글 삭제 : 사실 내용만 바꿈.
    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }

  /** 댓글 강제 삭제 **/
  async forceRemove(userId: number, commentId: number) {
    // 1. 댓글이 존재하는지 확인
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. user의 역할이 admin인지 확인
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        COMMENT_MESSAGE.COMMENT.FORCE_DELETE.FAILURE.FORBIDDEN
      );
    }

    // 3. 댓글 삭제 : 사실 내용만 바꿈.
    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }

  /** 댓글 좋아요 조회 API **/
  async getCommentLikes(commentId: number) {
    // 1. 댓글이 존재하는지 확인
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 총 댓글 좋아요 카운트
    const count = await this.commentLikeRepository.countBy({ commentId });
    return count;
  }

  /** 로그인한 사람의 댓글 좋아요 조회 API **/
  async getMyCommentLike(userId: number, commentId: number) {
    // 1. 댓글이 존재하는지 확인
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 2. 해당 댓글에 좋아요를 눌렀는지 확인
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

  /** 댓글 조회 **/
  async findOneBy(id: number) {
    return await this.commentRepository.findOneBy({ id });
  }
}
