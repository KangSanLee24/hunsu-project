import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({
  name: 'point_logs',
})
export class PointLogs {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  userId: number;

  @Column()
  point: number;

  @CreateDateColumn()
  createdAt: Date;
}
