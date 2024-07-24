import { Module } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { RecommentController } from './recomment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from 'src/comment/comment.module';
import { AuthModule } from 'src/auth/auth.module';
import { Comment } from 'src/comment/entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    CommentModule,
    AuthModule,
  ],
  controllers: [RecommentController],
  providers: [RecommentService]
})
export class RecommentModule {}
