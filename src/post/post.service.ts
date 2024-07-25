import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  /* 게시글 생성 API*/
  async create(createPostDto: CreatePostDto, userId: number) {
    const createdPost = await this.postRepository.save({
      ...createPostDto,
      userId,
    });
    return createdPost;
  }
  /*게시글 목록 조회 API*/
  async findAll() {
    return await this.postRepository.find();
  }

  /* 게시글 상세 조회 API*/
  async findOne(id: number) {
    return await this.postRepository.findOne({
      where: { id },
    });
  }

  // /*게시글 수정 API*/
  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }

  // /*게시글 삭제 API*/
  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
