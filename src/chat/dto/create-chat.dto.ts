import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @MaxLength(15, { message: '채팅방 이름은 15자 미만으로 입력해주세요.'})
  @IsNotEmpty({ message: '채팅방 이름을 입력해 주세요.' })
  title: string;
}
