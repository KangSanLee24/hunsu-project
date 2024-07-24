import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('postLikes')
export class PostLike {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.postLikes)
  post: Post;

  // @ManyToOne(() => User, (user) => user.postLikes)
  // user: User;
}
