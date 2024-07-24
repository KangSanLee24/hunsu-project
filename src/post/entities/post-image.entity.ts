import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'postImages' })
export class PostImage {
  // 게시글 이미지 ID, int
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 게시글 id = id, int
  @Column({ type: 'int', unsigned: true })
  postId: number;

  // 이미지 = URL, String
  @Column({ type: 'varchar' })
  imgUrl: string;

  // 생성일시 = createdAt, Date
  @CreateDateColumn()
  createdAt: Date;

  // 게시글 이미지와 게시글 다:1 관계
  // @ManyToOne(() => Post, (post) => post.postImages, {
  //   cascade: true,
  //   onDelete: 'CASCADE',
  // })
}
