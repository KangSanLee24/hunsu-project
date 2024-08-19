import { Controller, Post, Body, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('07. MAIL API')
@Controller('mails')
export class MailController {
  constructor(private readonly mailService: MailService) { }

  // /** 인증 메일 전송 API **/
  // @ApiOperation({ summary: '1. 인증 번호 메일 전송' })
  // @Post('send-email')
  // async sendEmail(@Query('email') email: string) {
  //   await this.mailService.sendEmail(email);
  // }
}
