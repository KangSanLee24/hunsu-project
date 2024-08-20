import { Module } from '@nestjs/common';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';

@Module({
  imports: [
  ],
  controllers: [ShoppingController],
  providers: [ShoppingService],
})
export class ShoppingModule { }
