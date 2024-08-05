import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';
import { LogIn } from 'src/decorators/log-in.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { Order } from 'src/post/types/post-order.type';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('9. CHAT API')
@Controller('chatrooms')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * 채팅방 생성
   * @param createChatDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createChatRoom(
    @LogIn() user: User,
    @Body() createChatDto: CreateChatDto
  ) {
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
   * hot live chat 조회
   * @returns
   */
  @Get('hotlivechat')
  async getHotLiveChat(@Query('num') num: number) {
    return await this.chatService.getHotLiveChat(+num);
  }

  /**
   * 채팅방 검색
   * @returns
   */
  @Get('search')
  async chatRoomSearch(@Query('title') title: string, @Query('sort') sort: Order) {
    return await this.chatService.chatRoomSearch(title, sort);
  }

  /**
   * 채팅방 입장
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post(':chatRoomId/join')
  async joinChatRoom(@Param('chatRoomId') chatRoomId: string, @Body() body) {
    const { authorId } = body;
    return await this.chatService.joinChatRoom(+chatRoomId, authorId);
  }

  /**
   * 채팅방 이미지 전송
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Post(':chatRoomId/image')
  @UseInterceptors(FileInterceptor('file'))
  async sendImageRoom(
    @Param('chatRoomId') chatRoomId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body
  ) {
    const { author } = body;
    const fileUrl = await this.chatService.sendImageRoom(
      +chatRoomId,
      author,
      file
    );
    return { fileUrl };
  }

  /**
   * 채팅방 나가기
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':chatRoomId/out')
  async outChatRoom(@Param('chatRoomId') chatRoomId: string, @Body() body) {
    const { authorId } = body;
    return await this.chatService.outChatRoom(+chatRoomId, authorId);
  }

  /**
   * 채팅방 삭제
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete(':chatRoomId')
  async removeChatRoom(@Param('chatRoomId') chatRoomId: string,  @Body() body) {
    const { authorId } = body;
    return await this.chatService.removeChatRoom(+chatRoomId, authorId);
  }
}
