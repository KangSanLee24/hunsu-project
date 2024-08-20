import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  helloLogger() {
    const data = {
      status: 200,
      message: 'hello!!',
    };
    return data;
  }
}
