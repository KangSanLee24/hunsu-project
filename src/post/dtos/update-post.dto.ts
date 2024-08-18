import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { Category } from '../types/post-category.type';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { POST_MESSAGE } from 'src/constants/post-message.constant';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ example: '내가 한 수 보여주지!' })
  title: string;

  @ApiProperty({ example: '이 옷은 신기한데요! 절 멋쟁이도 만들어줘요' })
  content: string;

  @IsArray() // 배열로 변경
  @IsOptional() // 선택 사항으로 설정
  @IsString({ each: true }) // 배열의 각 요소가 문자열인지 확인
  @ApiProperty({ example: ['urlExample1', 'urlExample2'] }) // 올바른 배열 예시
  urlsArray?: string[];

  @IsEnum(Category)
  @IsOptional()
  @ApiProperty({ example: 'CHAT', enum: Category })
  category?: Category;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '#청바지 #안경 #모자' }) // 올바른 배열 예시
  hashtagsString?: string;
}
