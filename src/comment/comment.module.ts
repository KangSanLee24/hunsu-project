import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { LikeModule } from 'src/like/like.module';
import { DislikeModule } from 'src/dislike/dislike.module';
import { CommentLike } from 'src/like/entities/comment-like.entity';
import { CommentDislike } from 'src/dislike/entities/comment-dislike.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Comment,
      User,
      Post,
      CommentLike,
      CommentDislike,
    ]),
    UserModule,
    AuthModule,
    LikeModule,
    DislikeModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService],
})
export class CommentModule {}
