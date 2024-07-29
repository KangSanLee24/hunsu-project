import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty({ message: '채팅방 이름을 입력해 주세요.' })
  title: string;
}
