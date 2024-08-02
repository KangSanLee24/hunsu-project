import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HashtagFromType } from '../types/hashtag-from.type';

@Entity({
  name: 'hashtags',
})
export class Hashtag {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', name: 'hashtag_item' })
  hashtagItem: string;

  @Column({ type: 'int', name: 'count'})
  count: number;

  @Column({ name: 'hashtag_type' })
  hashtagType: HashtagFromType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
