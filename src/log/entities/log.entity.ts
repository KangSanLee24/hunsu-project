import { Entity, PrimaryGeneratedColumn, Column, Timestamp } from 'typeorm';
import { LogMethodType, LogStatusCodeType } from '../types/log.type';
import { IsOptional } from 'class-validator';

@Entity({
  name: 'logs',
})
export class Log {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  timestamp: string;

  @Column({ type: 'varchar', nullable: false, default: 'SystemEtc' })
  context: string;

  @Column({ type: 'varchar', nullable: false })
  level: string;

  @Column({ type: 'text', nullable: false })
  message: string;

  @IsOptional()
  @Column({ type: 'enum', enum: LogMethodType, nullable: true })
  reqMethod?: LogMethodType;

  @IsOptional()
  @Column({ type: 'varchar', nullable: true })
  reqOriginalUrl?: string;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  resDuration?: number;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  resStatus?: number;

  @IsOptional()
  @Column({ type: 'int', nullable: true })
  userId?: number;

  @IsOptional()
  @Column({ type: 'varchar', nullable: true })
  userIp?: string;

  @IsOptional()
  @Column({ type: 'text', nullable: true })
  userAgent?: string;
}
