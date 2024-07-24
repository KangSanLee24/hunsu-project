import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGES.SIGN_UP.FAILURE.NO_EMAIL })
  @ApiProperty({ example: 'test@naver.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.SIGN_UP.FAILURE.NO_NICKNAME })
  @ApiProperty({ example: '패션왕' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.SIGN_UP.FAILURE.NO_PASSWORD })
  @ApiProperty({ example: 'Test!@34' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.SIGN_UP.FAILURE.NO_PASSWORD_CONFIRM })
  @ApiProperty({ example: 'Test!@34' })
  passwordConfirm: string;
}
