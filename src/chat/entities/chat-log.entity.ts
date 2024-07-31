import { IsNotEmpty, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatRoom } from './chat-room.entity';

@Entity('chat_logs')
export class ChatLog {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'room_id', unsigned: true })
  roomId: number;

  @Column({ type: 'int', name: 'member_id', unsigned: true })
  memberId: number;

  /**
   * 내용
   * @example "테스트 채팅내용"
   */
  @IsNotEmpty({ message: '채팅내용을 입력해 주세요.' })
  @IsString()
  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
