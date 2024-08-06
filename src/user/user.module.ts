import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Point } from 'src/point/entities/point.entity';
import { PointLog } from '../point/entities/point-log.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Point, PointLog, Post, Comment])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
