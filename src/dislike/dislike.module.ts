import { Module } from '@nestjs/common';
import { DislikeService } from './dislike.service';
import { DislikeController } from './dislike.controller';

@Module({
  controllers: [DislikeController],
  providers: [DislikeService]
})
export class DislikeModule {}
