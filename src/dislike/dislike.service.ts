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
    // @InjectRepository(PostLike)
    // private readonly postLikeRepository: Repository<PostLike>,
    // @InjectRepository(CommentLike)
    // private readonly commentLikeRepository: Repository<CommentLike>
  ) {}

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
    else if (existingComment.userId === userId) {
      throw new BadRequestException(
        COMMENT_MESSAGE.DISLIKE.CREATE.FAILURE.NO_SELF
      );
    }

    // 댓글 싫어요 눌렀었는지 확인
    if (commentDislike) {
      throw new BadRequestException(
        COMMENT_MESSAGE.DISLIKE.CREATE.FAILURE.ALREADY
      );
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
    const existingCommentDislike =
      await this.commentDislikeRepository.findOneBy({
        userId: userId,
        commentId: commentId,
      });

    // 댓글 존재 확인
    if (!existingComment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 내 싫어요 남아있는지 확인 //
    if (!existingCommentDislike) {
      throw new NotFoundException(
        COMMENT_MESSAGE.DISLIKE.DELETE.FAILURE.NO_DISLIKE
      );
    }

    await this.commentDislikeRepository.delete({
      userId,
      commentId,
    });
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
  async postDislike(userId: number, postId: number) {
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

    // // 2. 혹시 내가 좋아요를 누른 글인지 확인
    // const postlike = await this.postLikeRepository.findOneBy({
    //   userId,
    //   postId,
    // });
    // // 2-1. 이미 좋아요를 누른 글이라면 에러처리
    // if (postlike) {
    //   throw new BadRequestException(
    //     POST_MESSAGE.DISLIKE.CREATE.FAILURE.ALREADY_LIKE
    //   );
    // }

    // 3. 내가 싫어요를 누른 상태인지 아닌지를 확인
    const postDislike = await this.postDislikeRepository.findOneBy({
      userId,
      postId,
    });
    if (!postDislike) {
      // 3-1. 게시글 싫어요 명단에 내가 없다면 => 게시글 싫어요 등록
      await this.postDislikeRepository.save({
        userId,
        postId,
      });
    } else {
      // 3-2. 게시글 싫어요 명단에 내가 있다면 => 게시글 싫어요 취소
      await this.postDislikeRepository.delete({
        userId,
        postId,
      });
    }
  }
}
