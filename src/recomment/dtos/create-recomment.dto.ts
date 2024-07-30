import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecommentDto {
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @ApiProperty({ example: '대댓글 테스트1' })
  content: string;
}
