import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { USER_MESSAGES } from 'src/constants/user-message.constant';

export class SoftdeleteUserDto {
    @IsEmail()
    @IsNotEmpty({ message: USER_MESSAGES.DELETE_ME.FAILURE.NO_EMAIL })
    @ApiProperty({ example: 'test@naver.com' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: USER_MESSAGES.DELETE_ME.FAILURE.NO_PASSWORD })
    @ApiProperty({ example: 'Test!@34' })
    password: string;
}
