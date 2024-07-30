import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class RecommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>
  ) {}

  //대댓글 찾기
  async findRecomment(recommentId: number) {
    const findRecomment = await this.commentRepository.findOne({
      where: { id: recommentId },
    });

    if (!findRecomment) {
      throw new NotFoundException('해당 대댓글이 없습니다.');
    }

    return findRecomment;
  }

  //대댓글 생성
  async createRecomment(
    commentId: number,
    user: User,
    createRecommentDto: CreateRecommentDto
  ) {
    // 댓글에 대댓글에 대댓글이 가능해서 수정.
    const findPost = await this.commentRepository.findOne({
      where: { id: commentId, parentId: IsNull() },
    });

    if (!findPost) {
      throw new BadRequestException('댓글이 존재하지 않습니다.');
    }

    const newRecomment = await this.commentRepository.save({
      parentId: commentId,
      postId: findPost.postId,
      userId: user.id,
      content: createRecommentDto.content,
    });

    return newRecomment;
  }

  //대댓글 수정
  async updateRecomment(
    commentId: number,
    recommentId: number,
    createRecommentDto: CreateRecommentDto
  ) {
    const updateRecomment = await this.commentRepository.update(
      { id: recommentId },
      { content: createRecommentDto.content }
    );

    return updateRecomment;
  }

  //대댓글 삭제

  async removeRecomment(commentId: number, recommentId: number) {
    const removeRecomment = await this.commentRepository.delete({
      id: recommentId,
    });

    return removeRecomment;
  }
}
