import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('00. Health Check')
@Controller()
export class AppController {
  @Get('health-check')
  healthCheck(): string {
    return 'This sever is healthy';
  }

  // 센트리 오류 확인용
  @Get('error')
  getError() {
    const lsw = null;
    return lsw.toString();
  }
}
