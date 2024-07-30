import { Comment } from 'src/comment/entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comment_dislikes')
export class CommentDislike {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @Column({ type: 'int', name: 'comment_id', unsigned: true })
  commentId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Comment, (comment) => comment.commentLikes)
  @JoinColumn({ name: 'comment_id', referencedColumnName: 'id' })
  comment: Comment;

  @ManyToOne(() => User, (user) => user.commentLikes)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
