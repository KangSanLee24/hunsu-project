import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AlarmFromType } from '../types/alarm-from.type';

@Entity('alarms')
export class Alarm {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column()
  fromType: AlarmFromType;

  @Column({ unsigned: true })
  fromNumber: number;

  @Column()
  notification: string;

  @Column({ default: false })
  isChecked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
