import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserService } from 'src/user/user.service';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { VerifyPassword } from 'src/auth/entities/verify-password.entity';
import { SubRedisService } from 'src/redis/sub.redis.service';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private readonly subRedisService: SubRedisService,

  ) {
    this.transporter = nodemailer.createTransport({
      // SMTP 설정
      host: 'smtp.gmail.com', //smtp host
      port: 465, // single connection
      secure: true,
      auth: {
        user: this.configService.get<string>('NODE_MAILER_ID'),
        pass: this.configService.get<string>('NODE_MAILER_PASSWORD'),
      },
    });
  }

  /** 인증 메일 전송 API **/
  async sendEmail(email: string, sourcePage:string) {
    try {
      const certification = await this.createCertification();

      let subject = '';
      let text = '';

      const client = this.subRedisService.getSubClient();

      await client.set(`verified:${email}`, certification);
      await client.expire(`verified:${email}`, 300);
      console.log(`redis : verified ${email}`);

      if(sourcePage === 'sign-up') {

        console.log('회원가입 페이지에서의 요청');

        subject = '[5zirap] 회원가입 인증 메일';
        text = `
        인증번호 4자리 : ${certification},
        안녕하세요. [5zirap]의 회원가입을 위한 인증 메일입니다.
        인증번호를 입력해 주세요.
        인증 유효시간은 5분 입니다.`;
      } else if(sourcePage === 'password-update') {

        console.log('비밀번호 변경 페이지에서의 요청');

        subject = '[5zirap] 비밀번호 변경 인증 메일';
        text = `
        인증번호 4자리 : ${certification},
        안녕하세요. [5zirap]의 비밀번호 변경을 위한 인증 메일입니다.
        인증번호를 입력해 주세요.
        인증 유효시간은 5분 입니다.`;
      }

      await this.transporter.sendMail({
        from: this.configService.get<string>('NODE_MAILER_ID'),
        to: email, // string or Array
        subject: subject,
        text: text,
      });

    } catch (err) {
      console.error('Error sending email:', err);
      throw new InternalServerErrorException(
        AUTH_MESSAGES.VERIFY_EMAIL.FAILURE.SEND_ERROR
      );
    }
  }

  /** 인증 코드 생성 **/
  async createCertification() {
    // 1. 1000 ~ 9999 사이 랜덤수 생성
    const certification = Math.floor(1000 + Math.random() * 8999);
    return certification;
  }
}
