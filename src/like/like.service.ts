import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './entities/comment-like.entity';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>
  ) { }

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
    else if ((existingComment.userId === userId)) {
      throw new BadRequestException(COMMENT_MESSAGE.LIKE.CREATE.FAILURE.NO_SELF);
    }

    // 댓글 좋아요 눌렀었는지 확인
    if (commentLike) {
      throw new BadRequestException(COMMENT_MESSAGE.LIKE.CREATE.FAILURE.ALREADY);
    }

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
    })

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 내 좋아요 남아있는지 확인
    if (!commentLike) {
      throw new NotFoundException(COMMENT_MESSAGE.LIKE.DELETE.FAILURE.NO_LIKE);
    }

    await this.commentLikeRepository.delete({
      userId,
      commentId,
    });
  }

  // 게시글 좋아요 조회 API
  async getPostLikes(postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });

    // 게시글 존재 확인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    const count = await this.postLikeRepository.countBy({ postId });

    return count;
  }

  // 게시글 좋아요 생성 API
  async createPostLike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });

    const postLike = await this.postLikeRepository.findOneBy({
      userId,
      postId,
    });

    // 게시글 존재 확인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 게시글 작성자 ID 비교 후 동일 유저이면 좋아요 금지
    else if (existingPost.userId == userId) {
      throw new BadRequestException(POST_MESSAGE.LIKE.CREATE.FAILURE.NO_SELF);
    }

    // 게시글 좋아요 눌렀었는지 확인
    if (postLike) {
      throw new BadRequestException(POST_MESSAGE.LIKE.CREATE.FAILURE.ALREADY);
    }

    await this.postLikeRepository.save({
      userId,
      postId,
    });
  }

  // 게시글 좋아요 삭제 API
  async deletePostLike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    const postLike = await this.postLikeRepository.findOneBy({
      userId,
      postId,
    });

    // 게시글 존재 확인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 내 좋아요 남아있는지 확인
    if (!postLike) {
      throw new NotFoundException(POST_MESSAGE.LIKE.DELETE.FAILURE.NO_LIKE);
    }

    await this.postLikeRepository.delete({
      userId,
      postId,
    });
  }
}
