import {
  HttpStatus,
  Controller,
  Get,
  Patch,
  Delete,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { AuthGuard } from '@nestjs/passport';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

import { UpdateUserDto } from './dtos/update-user.dto';
import { USER_MESSAGES } from 'src/constants/user-message.constant';
import { SoftdeleteUserDto } from './dtos/softdelete-user.dto';
import { COMMENT_MESSAGE } from 'src/constants/comment-message.constant';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

@ApiTags('02. USER API')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 내 정보 조회(R) API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 조회 API' })
  @Get('me')
  async myProfile(@LogIn() user: User) {
    const data = await this.userService.myProfile(user);
    return {
      status: HttpStatus.OK,
      message: USER_MESSAGES.READ_ME.SUCCESS,
      data: data,
    };
  }

  /** 사용자가 작성한 게시글 조회 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '6. 사용자가 작성한 게시글 조회 API' })
  @Get('/me/posts')
  async findAllPostByUser(@LogIn() user: User) {
    const userId = user.id;
    const userPosts = await this.userService.findAllPostByUser(userId);

    return {
      status: HttpStatus.OK,
      message: POST_MESSAGE.POST.READ_ALL.SUCCESS,
      data: userPosts,
    };
  }

  /** 사용자가 작성한 댓글 조회 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '5. 사용자가 작성한 댓글 조회 API' })
  @Get('/me/comments')
  async findAllCommentByUser(@LogIn() user: User) {
    const userId = user.id;
    const userComments = await this.userService.findAllCommentByUser(userId);

    return {
      status: HttpStatus.OK,
      message: COMMENT_MESSAGE.COMMENT.READ.SUCCESS,
      data: userComments,
    };
  }

  /** 내 정보 수정(U) API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 정보 수정 API' })
  @Patch('me')
  async updateMyProfile(
    @LogIn() user: User,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const data = await this.userService.updateMyProfile(user, updateUserDto);
    return {
      status: HttpStatus.OK,
      message: USER_MESSAGES.UPDATE_ME.SUCCESS,
      data: data,
    };
  }

  /** 사용자 정보 조회(R) API **/
  @ApiOperation({ summary: '회원 정보 조회 API' })
  @Get(':userId')
  async getUserInfo(@Param('userId') userId: number) {
    const data = await this.userService.getUserInfo(userId);
    return {
      status: HttpStatus.OK,
      message: USER_MESSAGES.READ.SUCCESS,
      data: data,
    };
  }

  /** 회원탈퇴(softdelete) API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원탈퇴 API' })
  @Delete('me')
  async softdeleteUser(
    @LogIn() user: User,
    @Body() softdeleteUserDto: SoftdeleteUserDto
  ) {
    const data = await this.userService.softdeleteUser(user, softdeleteUserDto);
    return {
      status: HttpStatus.OK,
      message: USER_MESSAGES.DELETE_ME.SUCCESS,
      data: data,
    };
  }
}
