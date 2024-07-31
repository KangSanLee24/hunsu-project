import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './entities/comment-like.entity';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

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
  ) {}

  async getCommentLikes(commentId: number) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!existingComment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    const count = await this.commentLikeRepository.countBy({ commentId });

    return count;
  }

  async createCommentLike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!existingComment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    } else if ((existingComment.userId = userId)) {
      throw new BadRequestException('자신의 댓글에 좋아요를 누를 수 없습니다.');
    }

    const commentLike = await this.commentLikeRepository.findOneBy({
      userId,
      commentId,
    });
    if (commentLike) {
      throw new BadRequestException('이미 좋아요를 누른 댓글입니다.');
    }

    await this.commentLikeRepository.save({
      userId,
      commentId,
    });
  }

  async deleteCommentLike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    if (!existingComment) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    await this.commentLikeRepository.delete({
      userId,
      commentId,
    });
  }

  async getPostLikes(postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    if (!existingPost) {
      throw new BadRequestException('게시글이 존재하지 않습니다.');
    }

    const count = await this.postLikeRepository.countBy({ postId });

    return count;
  }

  async createPostLike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    if (!existingPost) {
      throw new BadRequestException('게시글이 존재하지 않습니다.');
    } else if (existingPost.userId == userId) {
      throw new BadRequestException(
        '자신의 게시글에 좋아요를 누를 수 없습니다.'
      );
    }

    const postLike = await this.postLikeRepository.findOneBy({
      userId,
      postId,
    });
    if (postLike) {
      throw new BadRequestException('이미 좋아요를 누른 댓글입니다.');
    }

    await this.postLikeRepository.save({
      userId,
      postId,
    });
  }

  async deletePostLike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    if (!existingPost) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    await this.postLikeRepository.delete({
      userId,
      postId,
    });
  }
}
