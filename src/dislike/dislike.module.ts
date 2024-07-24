import { Module } from '@nestjs/common';
import { DislikeService } from './dislike.service';
import { DislikeController } from './dislike.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostDisLike } from './entities/post-dislike.entity';
import { CommentDislike } from './entities/comment-dislike.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostDisLike, CommentDislike])],
  controllers: [DislikeController],
  providers: [DislikeService],
})
export class DislikeModule {}
