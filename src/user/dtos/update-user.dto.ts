import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { USER_MESSAGES } from 'src/constants/user-message.constant';

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty({ message: USER_MESSAGES.UPDATE_ME.FAILURE.NO_NICKNAME })
  @ApiProperty({ example: '패션왕' })
  nickname: string;
}
