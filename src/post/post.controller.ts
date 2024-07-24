import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  async create(
    // @LogIn() user: User,
    @Body() createPostDto: CreatePostDto
  ) {
    const userId = 1; // user.id;
    const createdPost = await this.postService.create(createPostDto, userId);

    return {
      statusCode: 201,
      message: '게시판 생성에 성공하였습니다.',
      data: createdPost,
    };
  }

  // @Get()
  // async findAll() {
  //   const findAllPost = await this.postService.findAll();

  //   return {
  //     statusCode: 200,
  //     message: '게시글 목록 조회에 성공하였습니다.',
  //     data: findAllPost,
  //   };
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.postService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postService.remove(+id);
  // }
}
