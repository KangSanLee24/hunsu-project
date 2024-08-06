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
import { v4 as uuidv4 } from 'uuid'; // ES Modules

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
    const { title, content, category, urlsArray } = createPostDto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      withDeleted: true,
    });

    // 1. 권한 확인
    if (!user) {
      throw new UnauthorizedException(POST_MESSAGE.POST.UNAUTHORIZED);
    }

    // urlsArray가 비어있다면 pass
    if (urlsArray && urlsArray.length > 0) {
      // 1. 실제 content에 사용된 urlsArray를 뽑아낸다.
      const realUrlsArray = await this.filterImage(content);

      // 2. 입력받은 urlsArray와 비교해서 urlsArray에만 존재하는 url들을 뽑아낸다.
      const notUsedUrls = await this.filterOnlyOrlUrls(
        urlsArray,
        realUrlsArray
      );

      // 3. 뽑아낸 url들은 작성자가 작성 도중 파일을 업로드했다가 완료 시 삭제한 url이므로 aws s3에 지워준다.
      await Promise.all(
        notUsedUrls.map((fileUrl) => this.awsService.deleteFileFromS3(fileUrl))
      );
    }
    // 2. 게시글 저장
    const createdPost = this.postRepository.create({
      title,
      content,
      category,
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

    // 가상 컬럼 계산
    post.getLikesAndDislikes(); // 좋아요 수와 싫어요 수 계산

    return {
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      title: post.title,
      images: post.postImages.map((image) => image.imgUrl), // 게시글 이미지 : { 이미지 URL}
      category: post.category,
      content: post.content,
      // comments: post.comments, // 댓글
      numLikes: post.numLikes, // 좋아요 수
      numDislikes: post.numDislikes, // 싫어요 수
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  /*화제글 목록 조회 API*/
  async findHotPost(category: Category) {
    const now = new Date(); // 현재시간
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 현재시간으로부터 일주일전

    const posts = await this.postRepository.find({
      where: { createdAt: MoreThan(weekAgo), category }, // 최근 일주일 이내에 생성된 게시물들 가져오가
      relations: [
        'user',
        'postImages',
        'comments',
        'postLikes',
        'postDislikes',
      ],
    });

    // 각 게시글에 대해 좋아요 수와 싫어요 수 계산
    posts.forEach((post) => {
      post.getLikesAndDislikes(); // 가상 컬럼 계산
    });

    // 좋아요 수 기준으로 정렬하고, 좋아요 수가 같을 경우 댓글 수로 정렬
    const sortedPosts = posts.sort((a, b) => {
      if (b.numLikes === a.numLikes) {
        return b.comments.length - a.comments.length; // 댓글 수로 정렬
      }
      return b.numLikes - a.numLikes; // 좋아요 수로 정렬
    });

    // 상위 10개 게시글만 가져오기
    const topPosts = sortedPosts.slice(0, 10);

    return topPosts.map((post) => ({
      id: post.id,
      userId: post.userId,
      nickname: post.user.nickname,
      category: post.category,
      title: post.title,
      content: post.content,
      numLikes: post.numLikes, // 가상 컬럼 사용
      numDislikes: post.numDislikes, // 가상 컬럼 사용
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      numComments: post.comments.length,
    }));
  }

  /*게시글 수정 API*/
  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const { title, content, urlsArray, category } = updatePostDto;
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

    // 1. existingUrlsArray : 기존 작성물의 content에서 urls. (A)
    const existingUrlsArray = await this.filterImage(post.content);
    // 2. urlsArray : 작성 중 추가되었다 취소되었을 수도 있는 urls. (B)

    // 3. newUrlsArray : 입력받은 content에서 urls. (C)
    const newUrlsArray = await this.filterImage(content);

    // 4. A와 B의 합집합에서 C를 뺀 notUsedUrls: string[]을 구한다.
    const combinedUrls = [...new Set([...existingUrlsArray, ...urlsArray])]; // A U B
    const notUsedUrls = await this.filterOnlyOrlUrls(
      combinedUrls,
      newUrlsArray
    ); // (A U B) - C

    // 5. notUsedUrls에 해당되는 파일을 AWS S3에서 제거한다.
    await Promise.all(
      notUsedUrls.map((fileUrl) => this.awsService.deleteFileFromS3(fileUrl))
    );

    const updatedPost = await this.postRepository.update(
      { id },
      { title, content, category }
    );
    console.log('🚀 ~ PostService ~ update ~ updatedPost:', updatedPost);
    return await this.postRepository.findOneBy({ id });
  }

  /*게시글 삭제 API*/
  async remove(
    id: number, // post.id
    userId: number // user.id
  ) {
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
      throw new ForbiddenException(POST_MESSAGE.POST.DELETE.FAILURE.FORBIDDEN);
    }

    // 게시글 content에서 URL 추출
    const imageUrls = await this.filterImage(post.content);

    // AWS S3에서 이미지 삭제
    if (imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map((url) => this.awsService.deleteFileFromS3(url))
      );
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

    // 게시글 content에서 URL 추출
    const imageUrls = await this.filterImage(post.content);

    // 강제 삭제 시에도 AWS S3에서 이미지 삭제
    if (imageUrls.length > 0) {
      await Promise.all(
        imageUrls.map((url) => this.awsService.deleteFileFromS3(url))
      );
    }

    return this.postRepository.remove(post);
  }

  /** 이미지 업로드 API **/
  async uploadPostImages(files: Express.Multer.File[]) {
    const uuid = uuidv4();
    // 업로드된 이미지 URL을 저장할 배열을 초기화한다
    const uploadedImageUrls: string[] = [];

    // 파일 배열을 순회하여 각 파일을 처리한다
    for (const file of files) {
      const [fileName, fileExt] = file.originalname.split('.');
      // 파일을 S3에 업로드하고 URL을 반환받는다
      const fileUrl = await this.awsService.imageUploadToS3(
        // 업로드
        `${Date.now()}_${uuid}`, // 이미지 이름과 URL이 같고 이미지는 다르게 되는 경우를 방지하고자 날짜를 넣음
        'posts',
        file,
        fileExt
      );

      // 업로드된 이미지 URL을 배열에 추가
      uploadedImageUrls.push(fileUrl);
    }

    // 업로드된 이미지 URL 배열 반환
    return uploadedImageUrls;
  }

  /** content에서 ![](https://gangsanbucket.s3.ap-northeast-2.amazonaws.com ... ) 의 url만
   * 뽑아 배열 return하는 메소드**/
  async filterImage(content: string): Promise<string[]> {
    // 1. 정규표현식 정의
    const regex =
      /!\[.*?\]\(https:\/\/gangsanbucket\.s3\.ap-northeast-2\.amazonaws\.com.*?\)/g;

    // 2. 정규표현식과 일치하는 모든 부분을 찾기
    const matches = content.match(regex) || [];

    // 3. 각 match에서 URL 부분만 추출하여 배열로 저장
    const urls = matches.map((match) => {
      const urlMatch = match.match(
        /https:\/\/gangsanbucket\.s3\.ap-northeast-2\.amazonaws\.com[^\)]*/
      );
      return urlMatch ? urlMatch[0] : '';
    });

    return urls;
  }

  /** oldUrls와 newUrls를 받고 oldUrls에만 존재하는 URL만 배열로 뽑아내는 메소드 **/
  async filterOnlyOrlUrls(
    oldUrls: string[],
    newUrls: string[]
  ): Promise<string[]> {
    // 배열이 아닌 경우 빈 배열 반환
    if (!Array.isArray(oldUrls) || !Array.isArray(newUrls)) {
      throw new TypeError('oldUrls and newUrls must be arrays');
    }
    // newUrls 배열을 Set으로 변환하여 빠른 조회 가능하도록 함
    const newUrlSet = new Set(newUrls);

    // oldUrls 배열을 순회하면서 newUrls에 없는 URL만 필터링하여 반환
    const uniqueOldUrls = oldUrls.filter((url) => !newUrlSet.has(url));

    return uniqueOldUrls;
  }
}
