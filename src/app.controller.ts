import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health-check')
  healthCheck(): string {
    console.log(process.env.NODE_ENV);
    return 'This sever is healthy';
  }
}
