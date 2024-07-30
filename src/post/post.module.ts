import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';
import { User } from 'src/user/entities/user.entity';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostImage, User]), AwsModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
