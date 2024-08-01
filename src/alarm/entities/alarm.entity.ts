import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('alarms')
export class Alarm {
  @PrimaryColumn({ unsigned: true })
  id: number;

  @Column()
  userId: number;

  @Column()
  fromType: string;

  @Column()
  fromNumber: number;

  @Column()
  notification: string;

  @Column()
  isChecked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
