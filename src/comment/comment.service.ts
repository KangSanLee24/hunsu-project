import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.FAILURE.NO_POST);
    }

    const data = await this.commentRepository.save({
      userId,
      postId,
      ...createCommentDto,
    });

    return data;
  }

  async findCommentsByPostId(postId: number) {
    // comments
    const comments = await this.commentRepository.find({
      where: { postId, parentId: IsNull() },
    });

    // recomments
    const commentsWithRecomments = await Promise.all(
      comments.map(async (comment) => {
        const recomments = await this.commentRepository.find({
          where: { postId, parentId: comment.id },
        });

        return { ...comment, recomments };
      })
    );

    return commentsWithRecomments;
  }

  async findOneBy(id: number) {
    return await this.commentRepository.findOneBy({ id });
  }

  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.FAILURE.NO_POST);
    }

    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.FAILURE.NO_COMMENT);
    } else if (comment.userId !== userId) {
      throw new ForbiddenException(COMMENT_MESSAGE.FAILURE.UN_AUTH);
    }

    const updatedComment = await this.commentRepository.save({
      id: commentId,
      ...updateCommentDto,
    });
    return updatedComment;
  }

  async remove(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.FAILURE.NO_COMMENT);
    } else if (comment.userId !== userId) {
      throw new ForbiddenException(COMMENT_MESSAGE.FAILURE.UN_AUTH);
    }

    await this.commentRepository.save({
      id: commentId,
      content: COMMENT_MESSAGE.ETC.DELETED_COMMENT,
    });
  }
}
