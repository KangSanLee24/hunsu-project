import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './entities/comment-like.entity';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { PointService } from 'src/point/point.service';
import { PointType } from 'src/point/types/point.type';
import { PostDislike } from 'src/dislike/entities/post-dislike.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    // @InjectRepository(PostDislike)
    // private readonly postDislikeRepository: Repository<PostDislike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    private readonly pointService: PointService
  ) {}

  // 댓글 좋아요 조회 API
  async getCommentLikes(commentId: number) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 댓글 좋아요 카운트
    const count = await this.commentLikeRepository.countBy({ commentId });

    return count;
  }

  // 댓글 좋아요 생성 API
  async createCommentLike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    const commentLike = await this.commentLikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 댓글 작성자 ID 비교 후 동일 유저이면 좋아요 금지
    else if (existingComment.userId === userId) {
      throw new BadRequestException(
        COMMENT_MESSAGE.LIKE.CREATE.FAILURE.NO_SELF
      );
    }

    // 댓글 좋아요 눌렀었는지 확인
    if (commentLike) {
      throw new BadRequestException(
        COMMENT_MESSAGE.LIKE.CREATE.FAILURE.ALREADY
      );
    }

    // 댓글 좋아요 생성 포인트 지급
    const isValidPoint = await this.pointService.validatePointLog(
      userId,
      PointType.COMMENT_LIKE
    );
    if (isValidPoint)
      this.pointService.savePointLog(userId, PointType.COMMENT_LIKE, true);

    await this.commentLikeRepository.save({
      userId,
      commentId,
    });
  }

  // 댓글 좋아요 삭제 API
  async deleteCommentLike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    const commentLike = await this.commentLikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 내 좋아요 남아있는지 확인
    if (!commentLike) {
      throw new NotFoundException(COMMENT_MESSAGE.LIKE.DELETE.FAILURE.NO_LIKE);
    }

    // 댓글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.COMMENT_LIKE, false);

    await this.commentLikeRepository.delete({
      userId,
      commentId,
    });
  }

  /** 게시글 좋아요 조회 API **/
  async getPostLikes(postId: number) {
    // 1. 게시글이 존재하는지?
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 2. 해당 게시글의 총 좋아요 수 계산
    const count = await this.postLikeRepository.countBy({ postId });
    return count;
  }

  /** 로그인한 사람의 게시글 좋아요 조회 API **/
  async getMyPostLike(userId: number, postId: number) {
    // 1. 게시글이 존재하는지?
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 2. 해당 게시글 좋아요를 눌렀는지?
    const like = await this.postLikeRepository.findOneBy({
      userId,
      postId,
    });
    return like ? true : false;
  }

  /** 게시글 좋아요 클릭 API **/
  async postLike(userId: number, postId: number) {
    // 1. 좋아요를 누를 게시글 정보
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 게시글이 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }
    // 1-2. 본인의 게시글에는 좋아요를 누를 수 없도록
    if (existingPost.userId == userId) {
      throw new BadRequestException(POST_MESSAGE.LIKE.CREATE.FAILURE.NO_SELF);
    }

    // // 2. 혹시 내가 싫어요를 누른 글인지 확인
    // const postDislike = await this.postDislikeRepository.findOneBy({
    //   userId,
    //   postId,
    // });
    // // 2-1. 이미 싫어요를 누른 글이라면 에러처리
    // if (postDislike) {
    //   throw new BadRequestException(
    //     POST_MESSAGE.LIKE.CREATE.FAILURE.ALREADY_DISLIKE
    //   );
    // }

    // 3. 내가 좋아요를 누른 상태인지 아닌지를 확인
    const postLike = await this.postLikeRepository.findOneBy({
      userId,
      postId,
    });
    if (!postLike) {
      // 3-1-A. 게시글 좋아요 명단에 내가 없다면 => 게시글 좋아요 등록
      await this.postLikeRepository.save({
        userId,
        postId,
      });
      // 3-1-B. 게시글 좋아요 생성 포인트 지급
      const isValidPoint = await this.pointService.validatePointLog(
        userId,
        PointType.POST_LIKE
      );
      if (isValidPoint)
        this.pointService.savePointLog(userId, PointType.POST_LIKE, true);
    } else {
      // 3-2-A. 게시글 좋아요 명단에 내가 있다면 => 게시글 좋아요 취소
      await this.postLikeRepository.delete({
        userId,
        postId,
      });
      // 3-2-B. 게시글 좋아요 취소 포인트 차감
      this.pointService.savePointLog(userId, PointType.POST_LIKE, false);
    }
  }
}
