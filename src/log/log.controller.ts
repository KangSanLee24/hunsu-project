import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Delete,
  Param,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LogService } from './log.service';
import { GetAllLogsDto } from './dto/get-all-logs.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/types/user-role.type';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@ApiTags('99. LOG API')
@Controller('logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  /** 로그 목록 조회(R-L) API **/
  @ApiOperation({ summary: '1. 로그 목록 조회' })
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
    name: 'contextType',
    required: false,
  })
  @ApiQuery({
    name: 'levelType',
    required: false,
  })
  @ApiQuery({
    name: 'statusCodeType',
    required: false,
  })
  @ApiQuery({
    name: 'methodType',
    required: false,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'keyword',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'time',
    required: false,
    type: String,
  })
  @Get('')
  async getAllLogs(@Query() getAllLogsDto?: GetAllLogsDto) {
    const {
      page,
      limit,
      contextType,
      levelType,
      statusCodeType,
      methodType,
      userId,
      keyword,
      time,
    } = getAllLogsDto || {};
    const data = await this.logService.getAllLogs(
      page,
      limit,
      contextType,
      levelType,
      statusCodeType,
      methodType,
      userId,
      keyword,
      time
    );

    return {
      status: HttpStatus.OK,
      message: '로그 목록 조회에 성공했습니다.',
      data: data,
    };
  }

  /** 로그 DB전송(C) API **/
  @ApiOperation({ summary: '4. 로그 DB 전송' })
  @Post('log-transfer')
  async insertLogs() {
    const data = await this.logService.insertLogs();

    return {
      status: HttpStatus.CREATED,
      message: '로그 DB 전송에 성공했습니다.',
      data: data,
    };
  }

  /** 로그 DB전송(C) - 파일명 직접 입력 API **/
  @ApiOperation({ summary: '5. 로그 DB 전송 - 파일명 직접 입력' })
  @Post('log-transfer-test')
  async inserLogsTest() {
    const data = await this.logService.insertLogsTest();

    return {
      status: HttpStatus.CREATED,
      message: '로그 DB 전송에 성공했습니다.',
      data: data,
    };
  }

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
