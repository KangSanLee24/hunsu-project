import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { RecommentModule } from './recomment/recomment.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configValidationSchema } from './configs/env-validation.config';
import { typeOrmModuleOptions } from './configs/database.config';
import { AwsService } from './aws/aws.service';
import { AwsModule } from './aws/aws.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AlarmModule } from './alarm/alarm.module';
import { PointModule } from './point/point.module';
import { HashtagModule } from './hashtag/hashtag.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleService } from './schedule/schedule.service';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'front'), // public 폴더를 정적 파일의 루트로 설정
      serveRoot: '/', // 기본 URL 경로를 '/'로 설정
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      envFilePath:
        process.env.NODE_ENV === 'development'
          ? '.env.development'
          : '.env.production',
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    ScheduleModule.forRoot(),
    RedisModule,
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    RecommentModule,
    AwsModule,
    MailModule,
    ChatModule,
    EventsModule,
    AlarmModule,
    PointModule,
    HashtagModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AwsService, ScheduleService],
})
export class AppModule {}
