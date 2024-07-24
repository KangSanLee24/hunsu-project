import { Controller, Get, UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LogIn } from 'src/decorators/log-in.decorator';
import { AuthGuard } from '@nestjs/passport';

import { User } from './entities/user.entity';
import { UserService } from './user.service';

@ApiTags('2. USER API')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 내 정보 조회 API **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @Get('me')
  async myProfile(@LogIn() user: User) {
    const data = await this.userService.myProfile(user);
    return {
      status: 200,
      message: '내 정보 조회가 완료되었습니다.',
      data: data,
    };
  }
}
