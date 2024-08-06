import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Point } from './entities/point.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PointLog } from './entities/point-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Point, Comment, PointLog])],
  controllers: [PointController],
  providers: [PointService],
  exports: [PointService],
})
export class PointModule { }
