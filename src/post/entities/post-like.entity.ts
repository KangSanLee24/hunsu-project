import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @Column({ type: 'int', name: 'post_id', unsigned: true })
  postId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.postLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
