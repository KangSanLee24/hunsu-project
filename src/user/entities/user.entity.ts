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
import { Role } from '../types/user-role.type';
import { Comment } from 'src/comment/entities/comment.entity';
import { Post } from 'src/post/entities/post.entity';
import { CommentLike } from 'src/comment/entities/comment-like.entity';
import { CommentDislike } from 'src/comment/entities/comment-dislike.entity';
import { PostLike } from 'src/post/entities/post-like.entity';
import { PostDislike } from 'src/post/entities/post-dislike.entity';
import { Point } from 'src/point/entities/point.entity';
import { PointLog } from '../../point/entities/point-log.entity';
import { ChatRoom } from 'src/chat/entities/chat-room.entity';
import { SocialType } from '../types/social-type.type';

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

  @Column({ type: 'boolean', default: false })
  verifiedEmail: boolean;

  @Column({ type: 'varchar', nullable: true })
  socialId?: string;

  @Column({ type: 'enum', enum: SocialType, default: SocialType.OZIRAP })
  socialType: SocialType;

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

  @OneToMany(() => ChatRoom, (chatRoom) => chatRoom.user, { cascade: true })
  chatRooms: ChatRoom[];
}
