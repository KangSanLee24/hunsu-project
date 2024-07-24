import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentLike } from './entities/comment-like.entity';
import { Repository } from 'typeorm';
import { PostLike } from './entities/post-like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(PostLike)
    private readonly postLikeRepository: Repository<PostLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>
  ) {}

  async getCommentLikes(userId: number, commentId: number) {
    const count = await this.commentLikeRepository.countBy({
      userId,
      commentId,
    });

    return count;
  }

  async createCommentLike(userId, commentId) {
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
    await this.commentLikeRepository.delete({
      userId,
      commentId,
    });
  }

  async getPostLikes(userId, postId) {
    return 'This action adds a new like';
  }

  async createPostLike(userId, postId) {
    return `This action returns all like`;
  }

  async deletePostLike(userId, postId) {
    return `This action returns a like`;
  }
}
