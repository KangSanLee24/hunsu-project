import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Order } from '../types/post-order.type';
import { Category } from '../types/post-category.type';

export class FindAllPostsDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page: number = 1; // 기본값: 페이지 1

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit: number = 20; // 한 페이지에 20개의 게시글

  @IsOptional()
  @IsEnum(Order)
  sort: Order = Order.DESC;

  @IsOptional()
  @IsEnum(Category)
  category: Category;

  @IsOptional()
  @IsString()
  keyword: string;
}
