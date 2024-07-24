import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity({
  name: 'points',
})
export class Point {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unique: true, unsigned: true })
  userId: number;

  @Column({ default: 0 })
  accPoint: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
