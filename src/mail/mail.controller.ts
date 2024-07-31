import { Controller, Post, Body, Query } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mails')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  /** 인증 메일 전송 API **/
  @Post('send-email')
  async sendEmail(@Query('email') email: string) {
    await this.mailService.sendEmail(email);
  }
}
