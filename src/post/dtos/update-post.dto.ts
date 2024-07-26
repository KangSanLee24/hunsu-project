import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { IsEnum } from 'class-validator';
import { POST_MESSAGE } from 'src/constants/post-message.constant';
import { Category } from '../types/postCategory.type';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ example: '내가 한 수 보여주지!' })
  title: string;

  @ApiProperty({ example: '이 옷은 신기한데요! 절 멋쟁이도 만들어줘요' })
  content: string;

  @IsEnum(Category, { message: POST_MESSAGE.POST.CREATE.CATEGORY_EMPTY })
  @ApiProperty({ example: 'CHAT', enum: Category })
  category?: Category;
}
