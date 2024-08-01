import {
  ForbiddenException,
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
import { Role } from 'src/user/types/user-role.type';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';


@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  /** 댓글 생성 **/
  async createComment(
    userId: number,
    postId: number,
    createCommentDto: CreateCommentDto
  ) {
    const post = await this.postRepository.findOneBy({
      id: postId
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    // 권한 확인
    if (!user) {
      throw new UnauthorizedException(COMMENT_MESSAGE.COMMENT.UNAUTHORIZED);
    }

    // 게시글 확인
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }

    const data = await this.commentRepository.save({
      userId,
      postId,
      ...createCommentDto,
    });

    return data;
  }

  /** 댓글 목록 조회 **/
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

  /** 댓글 수정**/
  async update(
    userId: number,
    postId: number,
    commentId: number,
    updateCommentDto: UpdateCommentDto) {
    const post = await this.postRepository.findOneBy({ id: postId });
    const comment = await this.commentRepository.findOneBy({ id: commentId });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NO_POST);
    }

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    else if (comment.userId !== userId) {
      throw new ForbiddenException(COMMENT_MESSAGE.COMMENT.UPDATE.FAILURE.FORBIDDEN);
    }

    const updatedComment = await this.commentRepository.save({
      id: commentId,
      ...updateCommentDto,
    });
    return updatedComment;
  }

  /** 댓글 삭제 **/
  async remove(
    userId: number,
    commentId: number
  ) {
    const comment = await this.commentRepository.findOneBy({
      id: commentId
    });

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    else if (comment.userId !== userId) {
      throw new ForbiddenException(COMMENT_MESSAGE.COMMENT.DELETE.FAILURE.FORBIDDEN);
    }

    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }

  /** 댓글 강제 삭제 **/
  async forceRemove(userId: number, commentId: number) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    // 댓글이 존재하는지 확인
    if (!comment) {
      throw new NotFoundException(COMMENT_MESSAGE.COMMENT.NOT_FOUND);
    }

    // user의 역할이 admin인지 확인
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(COMMENT_MESSAGE.COMMENT.FORCE_DELETE.FAILURE.FORBIDDEN);
    }

    await this.commentRepository.save({
      id: commentId,
      content: '삭제된 댓글입니다.',
    });
  }
}
