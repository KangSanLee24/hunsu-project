import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/user/types/user-role.type';
import { AwsService } from 'src/aws/aws.service';
import { PostImage } from './entities/post-image.entity';
import { Category } from './types/post-category.type';
import { Order } from './types/post-order.type';
import { paginate } from 'nestjs-typeorm-paginate';
import { PointService } from 'src/point/point.service';
import { PointType } from 'src/point/types/point.type';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(PostImage)
    private readonly postImageRepository: Repository<PostImage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly awsService: AwsService,
    private readonly pointService: PointService
  ) {}

  /* 게시글 생성 API*/
  async create(createPostDto: CreatePostDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    // 1. 권한 확인
    if (!user) {
      throw new UnauthorizedException(POST_MESSAGE.POST.UNAUTHORIZED);
    }

    // 2. 게시글 저장
    const createdPost = this.postRepository.create({
      ...createPostDto,
      userId,
    });

    const post = await this.postRepository.save(createdPost);

    // 3. 게시글 생성 포인트 지급
    const isValidPoint = await this.pointService.validatePointLog(
      userId,
      PointType.POST
    );
    if (isValidPoint)
      this.pointService.savePointLog(userId, PointType.POST, true);

    return {
      id: post.id,
      userId: post.userId,
      nickname: user.nickname,
      title: post.title,
      category: post.category,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt, // 테스트를 위해 남겨둠 마무리에는 포스트아이디만 리턴할 예정
    };
  }

  /*게시글 목록 조회 API*/
  async findAll(
    page: number,
    limit: number,
    category?: Category,
    sort?: Order,
    keyword?: string
  ) {
    // 카테고리에 따른 정렬
    const sortCategory = category ? { category } : {};
    const keywordFilter = keyword ? { title: Like(`%${keyword}%`) } : {};

    const { items, meta } = await paginate<Post>(
      this.postRepository,
      {
        page,
        limit,
      },
      {
        where: { ...sortCategory, ...keywordFilter },
        relations: ['user', 'comments'],
        order: { createdAt: sort ? sort : 'DESC' }, // 정렬조건
      }
    );

    return {
      posts: items.map((post) => ({
        id: post.id,
        userId: post.userId,
        nickname: post.user.nickname,
        title: post.title,
        numComments: post.comments.length, // 댓글 수 배열로 표현됨
        category: post.category,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      meta,
    };
  }

  /* 게시글 상세 조회 API*/
  async findOne(id: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: [
        'user',
        'postImages',
        'comments',
        'postLikes',
        'postDislikes',
      ],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return {
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      images: post.postImages.map((image) => image.imgUrl), // 게시글 이미지 : { 이미지 URL}
      category: post.category,
      content: post.content,
      comments: post.comments, // 댓글
      numLikes: post.postLikes.length, // 좋아요 수
      numDislikes: post.postDislikes.length, // 싫어요 수
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /*화제글 목록 조회 API*/
  async findHotPost() {
    const now = new Date(); // 현재시간
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 현재시간으로부터 일주일전
    console.log('🚀 ~ PostService ~ findHotPost ~ weekAgo:', weekAgo);

    const posts = await this.postRepository.find({
      where: { createdAt: MoreThan(weekAgo) }, // 최근 일주일 이내에 생성된 게시물들 가져오가
      relations: ['user', 'postImages', 'comments', 'postLikes'],
      order: { numLikes: 'DESC' },
    });

    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      content: post.content,
      numLikes: post.numLikes,
      numDislikes: post.numDislikes,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      numComments: post.comments.length,
    }));
  }

  /*게시글 수정 API*/
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException(POST_MESSAGE.POST.UPDATE.FAILURE.FORBIDDEN);
    }

    await this.postRepository.update({ id }, updatePostDto);
    return await this.postRepository.findOneBy({ id });
  }

  /*게시글 삭제 API*/
  async remove(
    id: number, // post.id
    userId: number // user.id
  ) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['postImages'],
      withDeleted: true,
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // 작성자 본인인지 확인
    if (post.userId !== userId) {
      throw new ForbiddenException(POST_MESSAGE.POST.DELETE.FAILURE.FORBIDDEN);
    }
    // AWS S3에서 이미지 삭제
    // for문으로 s3 서비스의 삭제 메소드 이용해서 게시글에 속한 이미지 하나씩 삭제
    for (const image of post.postImages) {
      this.awsService.deleteFileFromS3(image.imgUrl);
    }

    // 게시글 삭제로 포인트 차감
    this.pointService.savePointLog(userId, PointType.POST, false);

    // DB에서 게시글 삭제
    this.postRepository.remove(post);
  }

  /*게시글 강제 삭제 API*/
  async forceRemove(id: number, userId: number) {
    //
    const post = await this.postRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    // 게시글이 존재하는지 확인
    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }

    // user의 역할이 admin인지 확인
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenException(
        POST_MESSAGE.POST.FORCE_DELETE.FAILURE.FORBIDDEN
      );
    }

    return this.postRepository.remove(post);
  }

  /** 이미지 업로드 API **/
  async uploadPostImages(id: number, files: Express.Multer.File[]) {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException(POST_MESSAGE.POST.NOT_FOUND);
    }
    // 업로드된 이미지 URL을 저장할 배열을 초기화한다
    const uploadedImageUrls: string[] = [];

    // 파일 배열을 순회하여 각 파일을 처리한다
    for (const file of files) {
      const [fileName, fileExt] = file.originalname.split('.');
      // 파일을 S3에 업로드하고 URL을 반환받는다
      const fileUrl = await this.awsService.imageUploadToS3(
        // 업로드
        `${Date.now()}_${fileName}`, // 이미지 이름과 URL이 같고 이미지는 다르게 되는 경우를 방지하고자 날짜를 넣음
        'posts',
        file,
        fileExt
      );
      // 업로드된 이미지의 URL을 db에 저장
      const postImage = this.postImageRepository.create({
        imgUrl: fileUrl,
        postId: post.id,
      });
      await this.postImageRepository.save(postImage);

      // 업로드된 이미지 URL을 배열에 추가
      uploadedImageUrls.push(fileUrl);
    }

    // 업로드된 이미지 URL 배열 반환
    return uploadedImageUrls;
  }
}
