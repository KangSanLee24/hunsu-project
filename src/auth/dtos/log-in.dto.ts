import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class LogInDto {
  @IsEmail()
  @IsNotEmpty({ message: AUTH_MESSAGES.LOG_IN.FAILURE.NO_EMAIL })
  @ApiProperty({ example: 'test@naver.com' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: AUTH_MESSAGES.LOG_IN.FAILURE.NO_PASSWORD })
  @ApiProperty({ example: 'Test!@34' })
  password: string;
}
