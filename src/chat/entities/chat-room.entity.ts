import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatMember } from './chat-member.entity';
import { ChatLog } from './chat-log.entity';
import { ChatImage } from './chat-image.entity';

@Entity('chat_rooms')
export class ChatRoom {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => User, (user) => user.chatRooms)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  /**
   * 채팅방 명
   * @example "테스트 채팅방1"
   */
  @IsNotEmpty({ message: '채팅방 명을 입력해 주세요.' })
  @IsString()
  @Column()
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ChatMember, (chatMember) => chatMember.chatRooms, { cascade: true })
  chatMembers: ChatMember[];
}
