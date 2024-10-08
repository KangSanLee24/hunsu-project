import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { AwsModule } from 'src/aws/aws.module';
import { PointModule } from 'src/point/point.module';
import { Point } from 'src/point/entities/point.entity';
import { PointLog } from 'src/point/entities/point-log.entity';
import { PostLike } from './entities/post-like.entity';
import { PostDislike } from './entities/post-dislike.entity';
import { RedisModule } from 'src/redis/redis.module';
import { AlarmModule } from 'src/alarm/alarm.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      User,
      Point,
      PointLog,
      PostLike,
      PostDislike,
    ]),
    AwsModule,
    PointModule,
    RedisModule,
    AlarmModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
