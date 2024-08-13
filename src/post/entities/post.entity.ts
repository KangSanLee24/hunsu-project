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
import { PostLike } from 'src/post/entities/post-like.entity';
import { PostDislike } from 'src/post/entities/post-dislike.entity';
import { Category } from '../types/post-category.type';
import { VirtualColumn } from 'src/decorators/count-like.decorator';

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

  // 가상 컬럼으로 좋아요 수
  @VirtualColumn()
  numLikes: number;

  // 가상 컬럼으로 싫어요 수
  @VirtualColumn()
  numDislikes: number;

  // 게시글 해시태그 배열
  @Column({ type: 'simple-array' })
  hashtags: string[];

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

  // 가상 컬럼을 계산하는 메서드
  getLikesAndDislikes() {
    this.numLikes = this.postLikes.length; // postLikes 배열의 길이를 통해 좋아요 수 계산
    this.numDislikes = this.postDislikes.length; // postDislikes 배열의 길이를 통해 싫어요 수 계산
  }
}
