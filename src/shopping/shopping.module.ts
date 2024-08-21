import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    ConfigModule,
    RedisModule
  ],
  controllers: [ShoppingController],
  providers: [ShoppingService],
})
export class ShoppingModule { }
