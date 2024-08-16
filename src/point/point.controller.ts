import {
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PointService } from './point.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';

@ApiTags('10. POINT API')
@Controller('points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /**
   * 출석 체크
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '출석 체크' })
  @Post('today')
  async create(@LogIn() user: User) {
    await this.pointService.checkAttendance(user);
    return {
      status: HttpStatus.OK,
      message: `출석 체크!`,
    };
  }

  /**
   * 오늘 포인트 획득 포인트와 누적포인트 조회
   * @param user
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '포인트 조회' })
  @Get('me')
  async findPoint(@LogIn() user: User) {
    const data = await this.pointService.getPointSummary(user.id);

    return {
      status: HttpStatus.OK,
      message: `포인트 조회에 성공했습니다.`,
      data,
    };
  }

  /** 누적 포인트 랭킹 조회
   *
   * @returns
   */
  @Get('ranks')
  async pointRank(@Query('num') num: number) {
    const data = await this.pointService.pointRank(+num);
    return {
      status: HttpStatus.OK,
      message: '종합 랭킹 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 주간 포인트 랭킹 조회
   *
   * @returns
   */
  @Get('ranks-weekly')
  async pointWeeklyRank(@Query('num') num: number) {
    const data = await this.pointService.pointWeeklyRank(+num);
    return {
      status: HttpStatus.OK,
      message: '주간 랭킹 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 주간 랭킹 조회 - 레디스 **/
  @Get('ranks-lastweek-redis')
  async getLastWeekPointRank() {
    const data = await this.pointService.getLastWeekPointRank();
    return {
      status: HttpStatus.OK,
      message: '주간 랭킹 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 종합 랭킹 조회 - 레디스 **/
  @Get('ranks-total-redis')
  async getTotalPointRank() {
    const data = await this.pointService.getTotalPointRank();
    return {
      status: HttpStatus.OK,
      message: '종합 랭킹 조회에 성공했습니다.',
      data: data,
    };
  }
}
