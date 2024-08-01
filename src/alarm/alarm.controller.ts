import {
  HttpStatus,
  Controller,
  Param,
  Query,
  Post,
  Get,
  Patch,
  Delete,
  UseGuards,
  Sse,
} from '@nestjs/common';
import { AlarmService } from './alarm.service';

import { LogIn } from 'src/decorators/log-in.decorator';
import { User } from 'src/user/entities/user.entity';

import { ALARM_MESSAGES } from 'src/constants/alarm-message.constant';
import { AlarmFromType } from './types/alarm-from.type';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('7. ALARM API')
@Controller('alarms')
export class AlarmController {
  constructor(private readonly alarmService: AlarmService) {}

  /** 1. 알람 생성(C) **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '1. 알람 생성' })
  @Post('')
  async createAlarm(
    @Query('userId') userId: number,
    @Query('fromType') fromType: AlarmFromType,
    @Query('fromNumber') fromNumber: number
  ) {
    const data = await this.alarmService.createAlarm(
      userId,
      fromType,
      fromNumber
    );
    return {
      status: HttpStatus.CREATED,
      message: ALARM_MESSAGES.CREATE.SUCCESS,
      data: data,
    };
  }

  /** 2. 알람 목록 조회(R-L) **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '2. 알람 목록 조회' })
  @Get('')
  async findAllAlarm(@LogIn() user: User) {
    const data = await this.alarmService.findAllAlarm(user);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.READ_LIST.SUCCESS,
      data: data,
    };
  }

  /** 3. 알람 클릭 (Link) **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '3. 알람 클릭' })
  @Get(':alarmId')
  async clickAlarm(@LogIn() user: User, @Param('alarmId') alarmId: number) {
    const data = await this.alarmService.clickAlarm(user, alarmId);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.CLICK.SUCCESS,
      data: data,
    };
  }

  /** 4-1. 알람 수정(U) - [읽음]처리(개별 선택) **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4-1. 알람 수정 - [읽음]처리(개별 선택)' })
  @Patch(':alarmId')
  async readAlarm(@LogIn() user: User, @Param('alarmId') alarmId: number) {
    const data = await this.alarmService.readAlarm(user, alarmId);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.UPDATE.SUCCESS,
      data: data,
    };
  }

  /** 4-2. 알람 수정(U) - [읽음]처리(남은 알람 전부) **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '4-2. 알람 수정 - [읽음]처리(남은 알람 전부)' })
  @Patch('')
  async readAllAlarm(@LogIn() user: User) {
    const data = await this.alarmService.readAllAlarm(user);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.UPDATE_ALL.SUCCESS,
      data: data,
    };
  }

  /** 5. 알람 수동 삭제(D) **/
  /** 5-1. 알람 수동 삭제(D) - 개별 선택 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '5-1. 알람 수동 삭제(D) - 개별 선택' })
  @Delete(':alarmId')
  async deleteAlarm(@LogIn() user: User, @Param('alarmId') alarmId: number) {
    const data = await this.alarmService.deleteAlarm(user, alarmId);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.DELETE.SUCCESS,
      data: data,
    };
  }

  /** 5-2. 알람 수동 삭제(D) - 읽음 처리된 것들 모두 **/
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '5-2. 알람 수동 삭제(D) - 읽음 처리된 것들 모두' })
  @Delete('')
  async deleteAllCheckedAlarm(@LogIn() user: User) {
    const data = await this.alarmService.deleteAllCheckedAlarm(user);
    return {
      status: HttpStatus.OK,
      message: ALARM_MESSAGES.DELETE_ALL.SUCCESS,
      data: data,
    };
  }

  /** 6. 알람 자동 삭제(D) **/
  // 1. 읽음 처리 된 이후 일주일 뒤 자동 삭제
  // 2. 읽음 처리 여부와 상관 없이 한달이 지난 알람은 자동 삭제
  // 서비스 로직은 여기에 두고
  // API 호출은 schedule(모듈 생성)에서 cron <- 이거 써서 삭제

  /** 7. 신규 생성 이벤트 알람 (SSE) **/
  @ApiOperation({ summary: '7. 신규 생성 이벤트 알람 (SSE)' })
  @Sse(':userId')
  newEventAlarm(@Param('userId') userId: number) {
    const data = this.alarmService.newEventAlarm(userId);
    return data;
  }
}
