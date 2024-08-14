import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('00. Health Check')
@Controller()
export class AppController {
  @Get('health-check')
  healthCheck(): string {
    return 'This sever is healthy';
  }
}
