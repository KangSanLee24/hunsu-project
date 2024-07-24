import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

@Injectable()
export class PostService {
  async create(createPostDto: CreatePostDto, userId: number) {
    const createdPost = {
      title: createPostDto.title,
      content: createPostDto.content,
      category: createPostDto.category,
    };
    return createdPost;
  }

  findAll() {
    return `This action returns all post`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} post`;
  // }

  // update(id: number, updatePostDto: UpdatePostDto) {
  //   return `This action updates a #${id} post`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} post`;
  // }
}
