import { Module } from '@nestjs/common';
import { DislikeService } from './dislike.service';
import { DislikeController } from './dislike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostDislike } from './entities/post-dislike.entity';
import { CommentDislike } from './entities/comment-dislike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Comment, PostDislike, CommentDislike]),
  ],
  controllers: [DislikeController],
  providers: [DislikeService],
})
export class DislikeModule { }
