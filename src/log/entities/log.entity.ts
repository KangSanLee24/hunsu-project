import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'logs',
})
export class Log {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  context: string;

  @Column()
  level: string;

  @Column()
  message: string;

  @Column()
  reqMethod?: string;

  @Column()
  reqOriginalUrl?: string;

  @Column()
  resDuration?: number;

  @Column()
  resStatus?: number;

  @Column()
  userId: number;

  @Column()
  userIp: string;

  @Column()
  userAgent: string;

  @Column()
  createdAt: Date;
}
