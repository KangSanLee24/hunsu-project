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
import { ChatRoom } from './chat-room.entity';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMembers)
  @JoinColumn({ name: 'room_id', referencedColumnName: 'id' })
  chatRooms: ChatRoom;

  @Column({ type: 'int', name: 'room_id', unsigned: true })
  roomId: number;

  @ManyToOne(() => User, (user) => user.chatRooms)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;
}
