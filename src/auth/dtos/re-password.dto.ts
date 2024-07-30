import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class RePasswordDto {
    @IsString()
    @IsNotEmpty({ message: AUTH_MESSAGES.RE_PASSWORD.FAILURE.NO_PASSWORD })
    @ApiProperty({ example: 'Test!@34' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: AUTH_MESSAGES.RE_PASSWORD.FAILURE.NO_PASSWORD })
    @ApiProperty({ example: 'Test!@34' })
    passwordConfirm: string;
}
