import { Module } from '@nestjs/common';
import { RecommentService } from './recomment.service';
import { RecommentController } from './recomment.controller';

@Module({
  controllers: [RecommentController],
  providers: [RecommentService]
})
export class RecommentModule {}
