import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';

@ApiTags('POSTS API')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /*게시글 생성 API */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Post()
  async create(@LogIn() user: User, @Body() createPostDto: CreatePostDto) {
    const userId = user.id;
    const createdPost = await this.postService.create(createPostDto, userId);

    return {
      status: HttpStatus.CREATED,
      message: POST_MESSAGE.POST.CREATE.SUCCESS,
      data: createdPost,
    };
  }

  /*게시글 목록 조회 API */
  @Get()
  async findAll() {
    const findAllPost = await this.postService.findAll();

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_ALL.SUCCESS,
      data: findAllPost,
    };
  }

  /* 게시글 상세 조회 API*/
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const findOnePost = await this.postService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_DETAIL.SUCCESS,
      data: findOnePost,
    };
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
  //   return this.postService.update(+id, updatePostDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.postService.remove(+id);
  // }
}
