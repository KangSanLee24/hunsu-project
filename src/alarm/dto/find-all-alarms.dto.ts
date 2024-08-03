import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FindAllAlarmsDto {
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
}
