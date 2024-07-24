import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { UpdateCommentDto } from './dtos/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { Post } from 'src/post/entities/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  /**
   * 댓글 생성 메소드
   * @param userId number
   * @param postId number
   * @param createCommentDto { content : string }
   * @returns
   */
  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('해당하는 게시글이 존재하지 않습니다.');
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

  /**
   * 댓글 ID를 입력하고 조회
   * @param id
   * @returns
   */
  async findOneBy(id: number) {
    return await this.commentRepository.findOneBy({ id });
  }

  /**
   *
   * @param userId number
   * @param postId number
   * @param commentId number
   * @param updateCommentDto { content: string}
   * @returns
   */
  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({ id: postId });
    if (!post) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    } else if (comment.userId !== userId) {
      throw new UnauthorizedException('해당 댓글에 접근 권한이 없습니다.');
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
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    } else if (comment.userId !== userId) {
      throw new UnauthorizedException('해당 댓글에 접근 권한이 없습니다.');
    }

    await this.commentRepository.delete({ id: commentId });
  }
}
