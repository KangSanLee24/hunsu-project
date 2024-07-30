import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { PostImage } from './post-image.entity';
import { Comment } from 'src/comment/entities/comment.entity';
import { PostLike } from 'src/like/entities/post-like.entity';
import { PostDislike } from 'src/dislike/entities/post-dislike.entity';
import { Category } from '../types/post-category.type';

@Entity({ name: 'posts' })
export class Post {
  // 게시글 id = id, int
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 사용자 id = userId, int
  @Column({ type: 'int', unsigned: true })
  userId: number;

  // 제목 = title, String
  @Column({ type: 'text' })
  title: string;

  // 카테고리 = category, enum
  // enum에는 패션, 잡담, 요리라는 선택지가 있다.
  @Column({ type: 'enum', enum: Category, default: Category.CHAT })
  category: Category;

  // 내용 = content, text
  @Column({ type: 'text' })
  content: string;

  // 좋아요수 = numLikes, int
  @Column({ type: 'int', default: 0 })
  numLikes: number;

  // 생성일시 = createdAt, Date
  @CreateDateColumn()
  createdAt: Date;

  // 수정일시 = updatedAt, Date
  @UpdateDateColumn()
  updatedAt: Date;

  // 게시글과 사용자 다:1 관계
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  // 게시글과 댓글 1대:다 관계
  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];

  // // 게시글과 좋아요 1대:다 관계
  @OneToMany(() => PostLike, (postLike) => postLike.post, { cascade: true })
  postLikes: PostLike[];

  // // 게시글과 싫어요 1대:다 관계
  @OneToMany(() => PostDislike, (postDislike) => postDislike.post, {
    cascade: true,
  })
  postDislikes: PostDislike[];

  // 게시글과 이미지 1대:다 관계
  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  postImages: PostImage[];
}
