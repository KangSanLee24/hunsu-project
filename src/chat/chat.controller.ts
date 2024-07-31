import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

//@UseGuards(JwtStrategy)
@ApiTags('채팅 API')
@Controller('chatrooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 채팅방 생성
   * @param createChatDto
   * @returns
   */
  @Post()
  async createChatRoom(@LogIn() user: User, @Body() createChatDto: CreateChatDto) {
    return await this.chatService.createChatRoom(user, createChatDto);
  }

  /**
   * 채팅방 목록 조회 (전체목록조회)
   * @returns
   */
  @Get()
  async findChatRooms() {
    return await this.chatService.findChatRooms();
  }

  /**
   * 채팅방 인원 계산
   * @returns
   */
  @Get(':chatRoomId/member-count')
  async memberCount(@Param('chatRoomId') chatRoomId: string) {
    return await this.chatService.memberCount(+chatRoomId);
  }

  /**
   * 채팅 마지막 시간 계산
   * @returns
   */
  @Get(':chatRoomId/chat-time')
  async chatLastTime(@Param('chatRoomId') chatRoomId: string) {
    return await this.chatService.chatLastTime(+chatRoomId);
  }

  /**
   * 채팅방 입장
   * @returns
   */
  @Post(':chatRoomId/join')
  async joinChatRoom(@Param('chatRoomId') chatRoomId: string, @LogIn() user: User) {
    return await this.chatService.joinChatRoom(+chatRoomId, user);
  }

  /**
   * 채팅방 이미지 전송
   * @returns
   */
  @Post(':chatRoomId/image')
  @UseInterceptors(FileInterceptor('file'))
  async sendImageRoom(@Param('chatRoomId') chatRoomId: string, @UploadedFile() file: Express.Multer.File, @Body() body) {
    const { author } = body;
    const fileUrl = await this.chatService.sendImageRoom(+chatRoomId, author, file);
    return { fileUrl };
  }

  /**
   * 채팅방 나가기
   * @returns
   */
  @Delete(':chatRoomId/out')
  async outChatRoom(@Param('chatRoomId') chatRoomId: string, @LogIn() user: User) {
    return await this.chatService.outChatRoom(+chatRoomId, user);
  }

  /**
   * 채팅방 삭제
   * @returns
   */
  @Delete(':chatRoomId')
  async removeChatRoom(@Param('chatRoomId') chatRoomId: string, @LogIn() user: User) {
    return await this.chatService.removeChatRoom(+chatRoomId, user);
  }
}
