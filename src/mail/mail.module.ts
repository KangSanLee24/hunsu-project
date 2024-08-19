import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { VerifyPassword } from 'src/auth/entities/verify-password.entity';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [MailerModule, TypeOrmModule.forFeature([User, VerifyPassword]), UserModule, RedisModule],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
