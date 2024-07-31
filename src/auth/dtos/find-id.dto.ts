import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AUTH_MESSAGES } from 'src/constants/auth-message.constant';

export class FindIdDto {
    @IsString()
    @IsNotEmpty({ message: AUTH_MESSAGES.SIGN_UP.FAILURE.NO_NICKNAME })
    @ApiProperty({ example: '패션왕' })
    nickname: string;
}
