import { HttpStatus, Injectable } from '@nestjs/common';
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

  //대댓글 생성

  async createRecomment(postId: number, commentId: number, createRecommentDto: CreateRecommentDto) {
    
    const newRecomment = await this.CommentRepository.save({
      parentId: commentId,
      postId: postId,
      userId: 1,
      content: createRecommentDto.content
    });
    
    return newRecomment;
  }

  async updateRecomment(postId: number, commentId: number, recommentId: number, createRecommentDto: CreateRecommentDto) {
    
  }

  async removeRecomment(postId: number, commentId: number, recommentId: number) {
    
  }
}
