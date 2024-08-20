import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('00. Health Check')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: Logger
  ) {}

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

  @Get('hello-logger')
  helloLogger() {
    this.logger.log('helloLogger => ', AppController.name);
    this.logger.debug('helloLogger => ', AppController.name);
    this.logger.verbose('helloLogger => ', AppController.name);
    this.logger.warn('helloLogger => ', AppController.name);

    try {
      throw new Error();
    } catch (error) {
      this.logger.error('helloLogger => ', error.stack, AppController.name);
    }

    return this.appService.helloLogger();
  }
}
