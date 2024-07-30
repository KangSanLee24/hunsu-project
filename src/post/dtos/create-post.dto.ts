import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { Category } from '../types/post-category.type';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.TITLE_EMPTY })
  @ApiProperty({ example: '내 옷 어떄? 별로야?' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.CONTENT_EMPTY })
  @ApiProperty({ example: '이렇게 소개팅 갈 건데 무난무난?' })
  content: string;

  @IsEnum(Category)
  @IsOptional()
  @ApiProperty({ example: 'CHAT', enum: Category })
  category?: Category;
}
