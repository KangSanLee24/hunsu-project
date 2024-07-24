import { Module } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { RecommentController } from './recomment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from 'src/comment/comment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CommentModule,
  ],
  controllers: [RecommentController],
  providers: [RecommentService]
})
export class RecommentModule {}
