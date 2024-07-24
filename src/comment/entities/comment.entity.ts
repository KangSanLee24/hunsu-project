import { IsNotEmpty, IsString } from 'class-validator';
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

@Entity({
  name: 'comments',
})
export class Comment {
    /**
     * 코맨트 id
     * @example 1
     */
    @PrimaryGeneratedColumn({ name: 'id', unsigned: true, type: 'int' })
    id: number;

    /**
     * 부모 댓글 id
     * @example 1
     */
    @IsNotEmpty()
    @Column({ type: 'int', name: 'parent_id', unsigned: true })
    parentId: number;

    /**
     * 게시글 id
     * @example 1
     */
    @Column({ type: 'int', name: 'post_id' })
    postId: number;

    /**
     * 사용자 id
     * @example 1
     */

    @Column({ type: 'int', name: 'user_id' })
    userId: number;

    /**
     * 내용
     * @example test댓글내용
     */
    @IsNotEmpty()
    @Column({ type: 'text', name: 'content' })
    content: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}