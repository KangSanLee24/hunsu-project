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
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { Category } from './types/post-category.type';
import { Order } from './types/post-order.type';

@ApiTags('게시글 API')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  /** 게시글 생성 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 생성 API' })
  @Post()
  async create(
    @LogIn() user: User,
    @Body() createPostDto: CreatePostDto
  ) {
    const userId = user.id;
    const createdPost = await this.postService.create(createPostDto, userId);

    return {
      status: HttpStatus.CREATED,
      message: POST_MESSAGE.POST.CREATE.SUCCESS,
      data: createdPost,
    };
  }

  /** 게시글 목록 조회 API **/
  @ApiOperation({ summary: '게시글 목록 조회 API' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: Category,
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: Order,
  })
  @Get()
  async findAll(
    @Query('category')
    category?: Category,
    @Query('sort') sort?: Order
  ) {
    const findAllPost = await this.postService.findAll(category, sort);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_ALL.SUCCESS,
      data: findAllPost,
    };
  }

  /** 게시글 상세 조회 API **/
  @ApiOperation({ summary: '게시글 상세 조회 API' })
  @Get(':postId')
  async findOne(
    @Param('postId') postId: number
  ) {
    const findOnePost = await this.postService.findOne(postId);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_DETAIL.SUCCESS,
      data: findOnePost,
    };
  }

  /** 화제글 목록 조회 API **/
  // @ApiOperation({ summary: '화제글 목록 조회 API' })
  // @Get('hot')
  // async findHotPost() {
  //   const hotPosts = await this.postService.findAll();
  //   return {
  //     statusCode: HttpStatus.OK,
  //     message: POST_MESSAGE.POST.READ_HOT.SUCCESS,
  //     data: hotPosts,
  //   };
  // }

  /** 게시글 수정 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 수정 API' })
  @Patch(':postId')
  async update(
    @LogIn() user: User,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const userId = user.id;
    const updatedPost = await this.postService.update(
      postId,
      updatePostDto,
      userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.UPDATE.SUCCESS,
      data: updatedPost,
    };
  }

  /** 게시글 삭제 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 삭제 API' })
  @Delete(':postId')
  async remove(
    @LogIn() user: User,
    @Param('postId') postId: number
  ) {
    const userId = user.id;
    await this.postService.remove(postId, userId);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.DELETE.SUCCESS,
    };
  }

  /** 게시글 강제 삭제 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 강제 삭제 API' })
  @Delete(':postId/admin')
  async forceRemove(
    @LogIn() user: User,
    @Param('id') id: number
  ) {
    const userId = user.id;
    await this.postService.forceRemove(id, userId);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.FORCE_DELETE.SUCCESS,
    };
  }

  /** 이미지 업로드 API **/
  @ApiOperation({ summary: '게시글 이미지 업로드 API' })
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    const uploadedImageUrl = await this.postService.uploadPostImage(id, file);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.IMAGE.UPLOAD.SUCCESS,
      data: uploadedImageUrl,
    };
  }
}
