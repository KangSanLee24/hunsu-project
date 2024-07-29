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
import { ChatMember } from './chat-member.entity';

@Entity('chat_logs')
export class ChatLog {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatLogs)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'id' })
  chatRooms: ChatRoom;

  @Column({ type: 'int', name: 'room_id', unsigned: true })
  roomId: number;

  // @ManyToOne(() => ChatMember, (chatMember) => chatMember.chatLogs)
  // @JoinColumn({ name: 'member_id', referencedColumnName: 'id' })
  // chatMembers: ChatMember;

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
