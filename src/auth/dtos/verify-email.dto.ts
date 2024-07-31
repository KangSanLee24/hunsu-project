import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGES.VERIFY_EMAIL.FAILURE.NO_EMAIL })
  @ApiProperty({ example: 'test@naver.com' })
  email: string;

  @IsNumber()
  @IsNotEmpty({ message: AUTH_MESSAGES.VERIFY_EMAIL.FAILURE.NO_CERTIFICATION })
  @ApiProperty({ example: '4733' })
  certification: number;
}
