import { Module } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { RecommentController } from './recomment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from 'src/comment/comment.module';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { UserModule } from 'src/user/user.module';
import { AlarmModule } from 'src/alarm/alarm.module';
import { Point } from 'src/point/entities/point.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Point, Post, Comment]),
    UserModule,
    CommentModule,
    AuthModule,
    AlarmModule,
  ],
  controllers: [RecommentController],
  providers: [RecommentService],
})
export class RecommentModule {}
