import { Module } from '@nestjs/common';
import { HashtagService } from './hashtag.service';
import { HashtagController } from './hashtag.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hashtag]), RedisModule],
  controllers: [HashtagController],
  exports: [HashtagService], 
  providers: [HashtagService],
})
export class HashtagModule {}
