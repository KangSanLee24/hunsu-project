import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from './entities/post-like.entity';
import { CommentLike } from './entities/comment-like.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Post, Comment, PostLike, CommentLike]),
  ],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule { }
