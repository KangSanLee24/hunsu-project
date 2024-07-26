import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { User } from 'src/user/entities/user.entity';
// import { Category } from './types/postCategory.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  /* 게시글 생성 API*/
  // 이미지 출력하기
  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾지 못하였습니다.');
    }
    const createdPost = this.postRepository.create({
      ...createPostDto,
      user,
    });

    const post = await this.postRepository.save(createdPost);
    return {
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      category: post.category,
      // 이미지
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }
  /*게시글 목록 조회 API*/
  async findAll() {
    const posts = await this.postRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }, // 최신순 정렬
    });
    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      category: post.category,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    }));
  }

  /* 게시글 상세 조회 API*/
  // userId, 닉네임 출력하기
  // 이미지 출력하기
  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      category: post.category,
      // 이미지
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      // 댓글
      // 대댓글
      // 좋아요
      // 싫어요
    };
  }
  /*이번주의 hot 게시물 조횟*/
  // [누적 좋아요]
  // /posts/hot
  // 화제글 목록 조회
  // 주석처리하고 지금 기준으로 일주일 좋아요 많은 순으로

  /*게시글 수정 API*/
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    await this.postRepository.update({ id }, updatePostDto);
    return await this.postRepository.findOneBy({ id });
  }

  /*게시글 삭제 API*/
  async remove(id: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException('권한이 없습니다.');
    }
    return this.postRepository.remove(post);
  }
}
