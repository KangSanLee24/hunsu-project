import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsEmail } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class RePasswordDto {
    @IsEmail()
    @IsNotEmpty({ message: AUTH_MESSAGES.LOG_IN.FAILURE.NO_EMAIL })
    @ApiProperty({ example: 'test@naver.com' })
    email: string;
}
