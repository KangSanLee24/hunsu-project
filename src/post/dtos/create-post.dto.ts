import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { Category } from '../types/post-category.type';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.TITLE_EMPTY })
  @ApiProperty({ example: '내 옷 어때? 별로야?' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.CONTENT_EMPTY })
  @ApiProperty({ example: '이렇게 소개팅 갈 건데 무난무난?' })
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
}
