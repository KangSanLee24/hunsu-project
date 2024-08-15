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
  Query,
  UploadedFiles,
  ParseIntPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { AuthGuard, IAuthGuard, Type } from '@nestjs/passport';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Category } from './types/post-category.type';
import { Order } from './types/post-order.type';
import { FindAllPostsDto } from './dtos/find-all-posts.dto';

@ApiTags('03. POST API')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /** 게시글 생성 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '1. 게시글 생성 API' })
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

  /** 게시글 목록 조회 API **/
  @ApiOperation({ summary: '2. 게시글 목록 조회 API' })
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
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
  })
  @Get()
  async findAll(@Query() findAllPostsDto?: FindAllPostsDto) {
    const { page, limit, category, sort, keyword } = findAllPostsDto || {};
    const findAllPost = await this.postService.findAll(
      page,
      limit,
      category,
      sort,
      keyword
    );

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_ALL.SUCCESS,
      data: findAllPost,
    };
  }

  /** 화제글 목록 조회 API **/
  @ApiOperation({ summary: '8. 화제글 목록 조회 API' })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: Category,
  })
  @Get('hot')
  async findHotPost(@Query('category') category: Category) {
    const hotPosts = await this.postService.findHotPost(category);
    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_HOT.SUCCESS,
      data: hotPosts,
    };
  }

  /** 이미지 업로드 API **/
  @ApiOperation({ summary: '6. 게시글 이미지 업로드 API' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('files'))
  @Post('images')
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const uploadedImageUrls = await this.postService.uploadPostImages(files);
    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.IMAGE.UPLOAD.SUCCESS,
      data: uploadedImageUrls,
    };
  }

  /** 게시글 상세 조회 API **/
  @ApiOperation({ summary: '3. 게시글 상세 조회 API' })
  @Get(':postId')
  async findOne(@Param('postId') postId: number) {
    const findOnePost = await this.postService.findOne(postId);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_DETAIL.SUCCESS,
      data: findOnePost,
    };
  }

  /** 게시글 수정 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4. 게시글 수정 API' })
  @Patch(':postId')
  async update(
    @LogIn() user: User,
    @Param('postId') postId: number,
    @Body() updatePostDto: UpdatePostDto
  ) {
    const userId = user.id;
    await this.postService.update(
      postId,
      updatePostDto,
      userId
    );

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.UPDATE.SUCCESS,
    };
  }

  /** 게시글 삭제 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '5. 게시글 삭제 API' })
  @Delete(':postId')
  async remove(@LogIn() user: User, @Param('postId') postId: number) {
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
  @ApiOperation({ summary: '7. 게시글 강제 삭제 API' })
  @Delete(':postId/admin')
  async forceRemove(@LogIn() user: User, @Param('id') id: number) {
    const userId = user.id;
    await this.postService.forceRemove(id, userId);

    return {
      statusCode: HttpStatus.OK,
      message: POST_MESSAGE.POST.FORCE_DELETE.SUCCESS,
    };
  }

  /** 게시글 좋아요 조회 API **/
  @ApiOperation({ summary: '9. 게시글 좋아요 조회 API' })
  @Get(':postId/likes')
  async getPostLikes(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.postService.getPostLikes(postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.FIND.SUCCESS,
      data,
    };
  }

  /** 로그인한 사람의 게시글 좋아요 조회 API **/
  @ApiOperation({ summary: '10. 나의 게시글 좋아요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':postId/likes/me')
  async getMyPostLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.postService.getMyPostLike(userId, postId);
    return {
      status: HttpStatus.OK,
      messgae: '나의 게시글 좋아요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 게시글 좋아요 클릭 API **/
  @ApiOperation({ summary: '11. 게시글 좋아요 클릭 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':postId/likes')
  async postLike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.postService.postLike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.LIKE.CLICK.SUCCESS,
    };
  }

  /** 게시글 싫어요 조회 API **/
  @ApiOperation({ summary: '12. 게시글 싫어요 조회 API' })
  @Get(':postId/dislikes')
  async getPostDislikes(@Param('postId', ParseIntPipe) postId: number) {
    const data = await this.postService.getPostDislikes(postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.FIND.SUCCESS,
      data,
    };
  }

  /** 로그인한 사람의 게시글 싫어요 조회 API **/
  @ApiOperation({ summary: '13. 나의 게시글 싫어요 여부 조회 API' })
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get(':postId/dislikes/me')
  async getMyPostDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    const data = await this.postService.getMyPostDislike(userId, postId);
    return {
      status: HttpStatus.OK,
      messgae: '나의 게시글 싫어요 여부 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 게시글 싫어요 클릭 API **/
  @ApiOperation({ summary: '14. 게시글 싫어요 클릭 API' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Patch(':postId/dislikes')
  async clickPostDislike(
    @LogIn() user: User,
    @Param('postId', ParseIntPipe) postId: number
  ) {
    const userId = user.id;
    await this.postService.clickPostDislike(userId, postId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.DISLIKE.CLICK.SUCCESS,
    };
  }
}
