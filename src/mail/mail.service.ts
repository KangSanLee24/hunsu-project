import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';
import { VerifyEmail } from './entities/verify-email.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
  private transporter;

  constructor(
    private configService: ConfigService,

    @InjectRepository(VerifyEmail)
    private verifyEmailRepository: Repository<VerifyEmail>
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
  async sendEmail(email: string) {
    try {
      // 1. 인증번호 생성
      const certification = await this.createCertification();

      // 2. 인증 DB에 기록
      // 2-1. 이미 인증번호를 받았는지 검색
      const alreadyEmail = await this.verifyEmailRepository.findOneBy({
        email,
      });
      // 2-2. 이미 받은 상태라면, 새 인증번호로 업데이트
      if (alreadyEmail) {
        await this.verifyEmailRepository.update({ email }, { certification });
      } else {
        // 2-3. 그렇지 않다면 정상 진행
        await this.verifyEmailRepository.save({
          email: email,
          certification: certification,
        });
      }

      // 3. 인증 메일 전송
      await this.transporter.sendMail({
        from: this.configService.get<string>('NODE_MAILER_ID'),
        to: email, //string or Array
        subject: '[5zirap] 회원 가입 인증 메일',
        text: `
        인증번호 4자리 : ${certification}, 
        이 인증번호 4자리를 입력하면 회원가입이 완료됩니다.`,
      });
    } catch (err) {
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
