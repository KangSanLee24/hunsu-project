import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecommentDto } from './dtos/create-recomment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from 'src/comment/entities/comment.entity';

@Injectable()
export class RecommentService {
  constructor(
    @InjectRepository(Comment)
    private CommentRepository: Repository<Comment>,
  ) {}

  //대댓글 찾기
  async findRecomment(recommentId: number) {

    const findRecomment = await this.CommentRepository.findOne({
      where: {id: recommentId}
    });

    if(!findRecomment) {
      throw new NotFoundException(
        '해당 대댓글이 없습니다.'
      )
    };

    return findRecomment;
  };

  //대댓글 생성

  async createRecomment(postId: number, commentId: number, createRecommentDto: CreateRecommentDto) {
    
    const newRecomment = await this.CommentRepository.save({
      parentId: commentId,
      postId: postId,
      userId: 1,   //임시
      content: createRecommentDto.content
    });
    
    return newRecomment;
  };

  //대댓글 수정

  async updateRecomment(postId: number, commentId: number, recommentId: number, createRecommentDto: CreateRecommentDto) {
    
    //유저 체크 로직

    await this.findRecomment(recommentId);

    const updateRecomment = await this.CommentRepository.update(
      {id: recommentId},
      {content: createRecommentDto.content}
    );

    return updateRecomment;
  };

  //대댓글 삭제

  async removeRecomment(postId: number, commentId: number, recommentId: number) {

    //유저 체크 로직
    
    await this.findRecomment(recommentId);

    const removeRecomment = await this.CommentRepository.delete(
      {id: recommentId},
    );

    return removeRecomment;
  };
}
