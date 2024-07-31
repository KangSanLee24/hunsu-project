import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  
  @Entity({ name: 'chat_Images' })
  export class ChatImage {
    // 이미지 ID
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;
    
    // 채팅방 id 
    @Column({ type: 'int', name: 'room_id', unsigned: true })
    roomId: number;

    // 사용자 id 
    @Column({ type: 'int', name: 'user_id', unsigned: true })
    userId: number;
  
    // 이미지 = URL, String
    @Column({ name: 'img_url', type: 'varchar' })
    imgUrl: string;
  
    // 생성일시 = createdAt, Date
    @CreateDateColumn()
    createdAt: Date;
  }
  