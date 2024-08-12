import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { CommentDislike } from 'src/comment/entities/comment-dislike.entity';
import { AlarmModule } from 'src/alarm/alarm.module';
import { PointModule } from 'src/point/point.module';
import { Point } from 'src/point/entities/point.entity';
import { PointLog } from 'src/point/entities/point-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      User,
      Post,
      CommentLike,
      CommentDislike,
      Point,
      PointLog,
    ]),
    UserModule,
    AuthModule,
    AlarmModule,
    PointModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
