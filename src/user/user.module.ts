import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Point } from './entities/point.entity';
import { PointLog } from './entities/point-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Point, PointLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
