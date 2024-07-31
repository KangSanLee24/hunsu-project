import {
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
import { CommentLike } from 'src/like/entities/comment-like.entity';
import { CommentDislike } from 'src/dislike/entities/comment-dislike.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CommentLike)
    private commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(CommentDislike)
    private commentDislikeRepository: Repository<CommentDislike>
  ) {}

  // 댓글 생성
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

  // 댓글 목록 조회 API
  async findCommentsByPostId(postId: number) {
    // comments
    const comments = await this.commentRepository.find({
      where: { postId, parentId: IsNull() },
    });

    // recomments, user nickname, likes, dislikes
    const commentsWithDetails = await Promise.all(
      comments.map(async (comment) => {
        const recomments = await this.commentRepository.find({
          where: { postId, parentId: comment.id },
        });

        const user = await this.userRepository.findOne({
          where: { id: comment.userId },
          select: ['nickname'],
        });

        const likes = await this.commentLikeRepository.count({
          where: { commentId: comment.id },
        });
        const dislikes = await this.commentDislikeRepository.count({
          where: { commentId: comment.id },
        });

        const recommentsWithDetails = await Promise.all(
          recomments.map(async (recomment) => {
            const recommentUser = await this.userRepository.findOne({
              where: { id: recomment.userId },
              select: ['nickname'],
            });

            const recommentLikes = await this.commentLikeRepository.count({
              where: { commentId: recomment.id },
            });
            const recommentDislikes = await this.commentDislikeRepository.count(
              {
                where: { commentId: recomment.id },
              }
            );

            return {
              ...recomment,
              nickname: recommentUser?.nickname,
              likes: recommentLikes,
              dislikes: recommentDislikes,
            };
          })
        );

        return {
          ...comment,
          nickname: user?.nickname,
          likes,
          dislikes,
          recomments: recommentsWithDetails,
        };
      })
    );

    return commentsWithDetails;
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

    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }
}
