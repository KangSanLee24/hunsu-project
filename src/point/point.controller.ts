import { Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PointService } from './point.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';

@ApiTags('point')
@Controller('/user/me/point')
export class PointController {
  constructor(private readonly pointService: PointService) { }

  // 출석 체크
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '출석 체크' })
  @Post()
  async create(@LogIn() user: User) {
    await this.pointService.checkAttendance(user.id);
    return {
      statusCode: HttpStatus.OK,
      message: `출석 체크!`,
    };
  }

  // 오늘 포인트 획득 포인트와 누적포인트 조회
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '포인트 조회' })
  @Get()
  async findPoint(@LogIn() user: User) {
    const data = await this.pointService.getPointSummary(user.id);

    return {
      statusCode: HttpStatus.OK,
      message: `포인트 조회에 성공했습니다.`,
      data,
    };
  }
}
