import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString({ message: '댓글 형식에 맞게 입력해 주세요.' })
  @IsNotEmpty({ message: '댓글 내용을 입력해 주세요.' })
  @ApiProperty({ example: '댓글 내용' })
  content: string;
}
