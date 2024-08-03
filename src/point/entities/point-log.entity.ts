import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { PointType } from '../types/point.type';

@Entity({
  name: 'point_logs',
})
export class PointLog {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column({ type: 'enum', enum: PointType })
  pointType: PointType;

  @Column()
  point: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.pointLogs)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
