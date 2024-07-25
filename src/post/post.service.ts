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

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  /* 게시글 생성 API*/
  // id 밑에 이미지 출력하기
  async create(createPostDto: CreatePostDto, userId: number) {
    const createdPost = await this.postRepository.save({
      ...createPostDto,
      userId,
    });
    return createdPost;
  }
  /*게시글 목록 조회 API*/
  // userId 대신에 닉네잉 출력하기
  async findAll() {
    return await this.postRepository.find();
  }

  /* 게시글 상세 조회 API*/
  // userId 대신에 닉네임 출력하기
  // 이미지 출력하기
  async findOne(id: number) {
    return await this.postRepository.findOne({
      where: { id },
    });
  }

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
