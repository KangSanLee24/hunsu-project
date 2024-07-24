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

  // 카테고리 = category, ???
  @Column({ type: 'varchar' })
  category: string;

  // 내용 = content, text
  @Column({ type: 'text' })
  content: string;

  // 생성일시 = createdAt, Date
  @CreateDateColumn()
  createdAt: Date;

  // 수정일시 = updatedAt, Date
  @UpdateDateColumn()
  updatedAt: Date;

  // // 게시글과 사용자 다:1 관계
  // @ManyToOne(() => User, (user) => user.posts, { cascade: true })
  // user: User;

  // // 게시글과 댓글 1대:다 관계
  // @OneToMany(() => Comment, (comment) => comment.posts, { cascade: true })
  // comments: Comment[];

  // // 게시글과 좋아요 1대:다 관계
  // // 게시글과 싫어요 1대:다 관계

  // // 게시글과 이미지 1대:다 관계
  // @OneToMany(() => Image, (image) => image.posts, { cascade: true })
  // postImages: PostImage[];
}
