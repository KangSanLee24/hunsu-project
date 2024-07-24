import { Post } from 'src/post/entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('postDislikes')
export class PostDisLike {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.postDisLikes)
  post: Post;

  // @ManyToOne(() => User, (user) => user.postDisLikes)
  // user: User;
}
