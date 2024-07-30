import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { Category } from '../types/post-category.type';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiProperty({ example: '내가 한 수 보여주지!' })
  title: string;

  @ApiProperty({ example: '이 옷은 신기한데요! 절 멋쟁이도 만들어줘요' })
  content: string;

  @IsEnum(Category)
  @IsOptional()
  @ApiProperty({ example: 'CHAT', enum: Category })
  category?: Category;
}
