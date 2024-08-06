import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class VerifyPasswordDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGES.VERIFY_PASSWORD.FAILURE.NO_EMAIL })
  @ApiProperty({ example: 'test@naver.com' })
  email: string;

  @IsNumber()
  @IsNotEmpty({ message: AUTH_MESSAGES.VERIFY_PASSWORD.FAILURE.NO_CERTIFICATION })
  @ApiProperty({ example: '4733' })
  certification: number;
}
