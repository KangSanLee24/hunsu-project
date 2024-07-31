import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { VerifyEmail } from './entities/verify-email.entity';
import { VerifyPassword } from 'src/auth/entities/verify-password.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [MailerModule, TypeOrmModule.forFeature([User, VerifyEmail, VerifyPassword]), UserModule,],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
