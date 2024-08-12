import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Point } from 'src/point/entities/point.entity';
import { PointLog } from 'src/point/entities/point-log.entity';
import { Post } from 'src/post/entities/post.entity';
import { Hashtag } from 'src/hashtag/entities/hashtag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post, Point, PointLog, Hashtag])],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
