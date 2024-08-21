import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Delete,
  Param,
  HttpStatus,
} from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogService } from './log.service';

@ApiTags('99. LOG API')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  //   /** 로그 목록 조회(R-L) API **/
  //   @ApiOperation({ summary: '1. 로그 목록 조회' })
  //   @Get('')
  //   async getAllLogs() {
  //     const data = await this.logService.getAllLogs();

  //     return {
  //       status: HttpStatus.OK,
  //       message: '로그 목록 조회에 성공했습니다.',
  //       data: data,
  //     };
  //   }

  /** 로그 상세 조회(R-D) API **/
  @ApiOperation({ summary: '2. 로그 상세 조회' })
  @Get(':logId')
  async getOneLog(@Param('logId') logId: number) {
    const data = await this.logService.getOneLog(logId);

    return {
      status: HttpStatus.OK,
      message: '로그 상세 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 로그 삭제(D) API **/
  @ApiOperation({ summary: '3. 로그 삭제' })
  @Delete(':logId')
  async deleteOneLog(@Param('logId') logId: number) {
    const data = await this.logService.deleteOneLog(logId);

    return {
      status: HttpStatus.OK,
      message: '로그 삭제에 성공했습니다.',
      data: data,
    };
  }
}
