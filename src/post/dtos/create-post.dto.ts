import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { Category } from '../types/postCategory.type';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.TITLE_EMPTY })
  @ApiProperty({ example: '내 옷 어떄? 별로야?' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.CONTENT_EMPTY })
  @ApiProperty({ example: '이렇게 소개팅 갈 건데 무난무난?' })
  content: string;

  // @IsEnum(Category, { message: POST_MESSAGE.POST.CREATE.CATEGORY_EMPTY })
  // @IsNotEmpty({ message: POST_MESSAGE.POST.CREATE.CATEGORY_EMPTY })
  // @ApiProperty({ example: 'FASHION', enum: Category })
  // category: Category;
}
