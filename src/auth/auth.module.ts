import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/jwt.strategy';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from 'src/user/entities/user.entity';
import { Point } from 'src/user/entities/point.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { VerifyEmail } from 'src/mail/entities/verify-email.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    // JWT 인증은 stateless 인증 메커니즘이므로 session은 false
    PassportModule.register({ defaultStrategy: 'jwt', session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Point,
      Post,
      Comment,
      RefreshToken,
      VerifyEmail,
    ]),
    ConfigModule,
    UserModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
