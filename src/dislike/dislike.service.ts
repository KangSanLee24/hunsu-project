import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { PostLike } from 'src/like/entities/post-like.entity';
import { CommentLike } from 'src/like/entities/comment-like.entity';

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
  ) {}

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
        COMMENT_MESSAGE.DISLIKE.CREATE.FAILURE.NO_SELF
      );
    }

    // 2. 내가 싫어요를 누른 상태인지 아닌지 확인
    const commentDislike = await this.commentDislikeRepository.findOneBy({
      userId,
      commentId,
    });
    if (!commentDislike) {
      // 2-1. 댓글 싫어요 명단에 내가 없다면 => 댓글 싫어요 등록
      await this.commentDislikeRepository.save({
        userId,
        commentId,
      });
    } else {
      // 2-2. 댓글 싫어요 명단에 내가 있다면 => 댓글 싫어요 취소
      await this.commentDislikeRepository.delete({
        userId,
        commentId,
      });
    }
  }

  /** 게시글 싫어요 조회 API **/
  async getPostDislikes(postId: number) {
    // 1. 게시글이 존재하는지?
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 2. 해당 게시글의 총 싫어요 수 계산
    const count = await this.postDislikeRepository.countBy({ postId });
    return count;
  }

  /** 로그인한 사람의 게시글 싫어요 조회 API **/
  async getMyPostDislike(userId: number, postId: number) {
    // 1. 게시글이 존재하는지?
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 2. 해당 게시글 싫어요를 눌렀는지?
    const dislike = await this.postDislikeRepository.findOneBy({
      userId,
      postId,
    });

    return dislike ? true : false;
  }

  /** 게시글 싫어요 클릭 API **/
  async clickPostDislike(userId: number, postId: number) {
    // 1. 싫어요를 누를 게시글 정보
    const existingPost = await this.postRepository.findOneBy({
      id: postId,
    });
    // 1-1. 게시글이 존재하지 않으면 에러처리
    if (!existingPost) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }
    // 1-2. 본인의 게시글에는 싫어요를 누를 수 없도록
    if (existingPost.userId == userId) {
      throw new BadRequestException(
        POST_MESSAGE.DISLIKE.CREATE.FAILURE.NO_SELF
      );
    }

    // 2. 내가 싫어요를 누른 상태인지 아닌지를 확인
    const postDislike = await this.postDislikeRepository.findOneBy({
      userId,
      postId,
    });
    if (!postDislike) {
      // 2-1. 게시글 싫어요 명단에 내가 없다면 => 게시글 싫어요 등록
      await this.postDislikeRepository.save({
        userId,
        postId,
      });
    } else {
      // 2-2. 게시글 싫어요 명단에 내가 있다면 => 게시글 싫어요 취소
      await this.postDislikeRepository.delete({
        userId,
        postId,
      });
    }
  }
}
