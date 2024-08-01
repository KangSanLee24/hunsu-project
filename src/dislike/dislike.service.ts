import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDislikeDto } from './dtos/create-dislike.dto';
import { UpdateDislikeDto } from './dtos/update-dislike.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentDislike } from './entities/comment-dislike.entity';
import { Repository } from 'typeorm';
import { PostDislike } from './entities/post-dislike.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@Injectable()
export class DislikeService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(PostDislike)
    private readonly postDislikeRepository: Repository<PostDislike>,
    @InjectRepository(CommentDislike)
    private readonly commentDislikeRepository: Repository<CommentDislike>
  ) { }

  // 댓글 싫어요 조회 API
  async getCommentDislikes(commentId: number) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 댓글 싫어요 카운트
    const count = await this.commentDislikeRepository.countBy({ commentId });

    return count;
  }

  // 댓글 싫어요 생성 API
  async createCommentDislike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    const commentDislike = await this.commentDislikeRepository.findOneBy({
      userId,
      commentId,
    });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 댓글 작성자 ID 비교 후 동일 유저이면 싫어요 금지
    else if ((existingComment.userId === userId)) {
      throw new BadRequestException(COMMENT_MESSAGE.DISLIKE.CREATE.FAILURE.NO_SELF);
    }

    // 댓글 싫어요 눌렀었는지 확인
    if (commentDislike) {
      throw new BadRequestException(COMMENT_MESSAGE.DISLIKE.CREATE.FAILURE.ALREADY);
    }

    await this.commentDislikeRepository.save({
      userId,
      commentId,
    });
  }

  // 댓글 싫어요 삭제 API
  async deleteCommentDislike(userId, commentId) {
    const existingComment = await this.commentRepository.findOneBy({
      id: commentId,
    });
    const existingCommentDislike = await this.commentDislikeRepository.findOneBy({
      userId: userId,
      commentId: commentId,
    })

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 내 싫어요 남아있는지 확인
    if (!existingCommentDislike) {
      throw new NotFoundException(COMMENT_MESSAGE.DISLIKE.DELETE.FAILURE.NO_DISLIKE);
    }

    await this.commentDislikeRepository.delete({
      userId,
      commentId,
    });
  }

  // 게시글 싫어요 조회 API
  async getPostDislikes(postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });

    // 게시글 존재 확인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    const count = await this.postDislikeRepository.countBy({ postId });

    return count;
  }

  // 게시글 싫어요 생성 API
  async createPostDislike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    const postLike = await this.postDislikeRepository.findOneBy({
      userId,
      postId,
    });

    // 게시글 존재 화인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 게시글 작성자 ID 비교 후 동일 유저이면 싫어요 금지
    else if (existingPost.userId == userId) {
      throw new BadRequestException(POST_MESSAGE.DISLIKE.CREATE.FAILURE.NO_SELF);
    }

    // 게시글 싫어요 눌렀었는지 확인
    if (postLike) {
      throw new BadRequestException(POST_MESSAGE.DISLIKE.CREATE.FAILURE.ALREADY);
    }

    await this.postDislikeRepository.save({
      userId,
      postId,
    });
  }

  // 게시글 싫어요 삭제 API
  async deletePostDislike(userId, postId) {
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    const PostDislike = await this.postDislikeRepository.findOneBy({
      userId,
      postId,
    });

    // 게시글 존재 확인
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 내 좋아요 남아있는지 확인
    if (!PostDislike) {
      throw new BadRequestException(POST_MESSAGE.DISLIKE.DELETE.FAILURE.NO_DISLIKE);
    }

    await this.postDislikeRepository.delete({
      userId,
      postId,
    });
  }
}
