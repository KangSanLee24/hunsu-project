import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Point } from './entities/point.entity';
import { PointLog } from './entities/point-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Point, PointLog])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
