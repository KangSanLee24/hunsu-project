import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../types/userRole.type';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { CommentLike } from 'src/like/entities/comment-like.entity';
import { CommentDislike } from 'src/dislike/entities/comment-dislike.entity';
import { PostLike } from 'src/like/entities/post-like.entity';
import { PostDislike } from 'src/dislike/entities/post-dislike.entity';
import { Point } from './point.entity';
import { PointLog } from './point-log.entity';

@Index('email', ['email'], { unique: true })
@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  nickname: string;

  @Column({ type: 'enum', enum: Role, default: Role.MEMBER })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @OneToMany(() => Post, (post) => post.user, { cascade: true })
  posts: Post[];

  @OneToMany(() => PostLike, (postLike) => postLike.user, {
    cascade: true,
  })
  postLikes: PostLike[];

  @OneToMany(() => PostDislike, (postDislike) => postDislike.user, {
    cascade: true,
  })
  postDislikes: PostDislike[];

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments: Comment[];

  @OneToMany(() => CommentLike, (commentLike) => commentLike.user, {
    cascade: true,
  })
  commentLikes: CommentLike[];

  @OneToMany(() => CommentDislike, (commentDislike) => commentDislike.user, {
    cascade: true,
  })
  commentDislikes: CommentDislike[];

  @OneToMany(() => Point, (point) => point.user, { cascade: true })
  points: Point[];

  @OneToMany(() => PointLog, (pointLog) => pointLog.user, { cascade: true })
  pointLogs: PointLog[];
}
