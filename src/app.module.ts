import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { RecommentModule } from './recomment/recomment.module';
import { LikeModule } from './like/like.module';
import { DislikeModule } from './dislike/dislike.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './configs/env-validation.config';
import { typeOrmModuleOptions } from './configs/database.config';
import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    RecommentModule,
    LikeModule,
    DislikeModule,
    AwsModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AwsService],
})
export class AppModule {}
