import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class FindIdDto {
    @IsEmail()
    @IsNotEmpty({ message: AUTH_MESSAGES.LOG_IN.FAILURE.NO_EMAIL })
    @ApiProperty({ example: 'test@naver.com' })
    email: string;
}
