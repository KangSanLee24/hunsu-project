import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CommentDislike } from 'src/dislike/entities/comment-dislike.entity';
import { CommentLike } from 'src/like/entities/comment-like.entity';
import { Post } from 'src/post/entities/post.entity';
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

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsOptional()
  @IsNumber()
  @Column({ nullable: true })
  parentId: number;

  /**
   * 내용
   * @example "댓글 테스트1"
   */
  @IsNotEmpty({ message: '내용을 입력해 주세요.' })
  @IsString({ message: '댓글 형식에 맞게 입력해 주세요' })
  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comments)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
  post: Post;

  @Column({ type: 'int', name: 'post_id', unsigned: true })
  postId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @OneToMany(() => CommentLike, (commentLike) => commentLike.comment, {
    cascade: true,
  })
  commentLikes: CommentLike[];

  @OneToMany(() => CommentDislike, (commentDislike) => commentDislike.comment, {
    cascade: true,
  })
  commentDislikes: CommentDislike[];
}
