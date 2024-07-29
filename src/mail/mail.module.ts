import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { VerifyEmail } from './entities/verify-email.entity';

@Module({
  imports: [MailerModule, TypeOrmModule.forFeature([User, VerifyEmail])],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
