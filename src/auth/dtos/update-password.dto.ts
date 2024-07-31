import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class UpdatePasswordDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGES.UPDATE_PASSWORD.FAILURE.NO_EMAIL })
  @ApiProperty({ example: 'test@naver.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.UPDATE_PASSWORD.FAILURE.NO_PASSWORD })
  @ApiProperty({ example: 'Test!@34' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.UPDATE_PASSWORD.FAILURE.NO_PASSWORD_CONFIRM })
  @ApiProperty({ example: 'Test!@34' })
  passwordConfirm: string;
}
