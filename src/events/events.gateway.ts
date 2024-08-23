import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { Logger, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';
import { format } from 'date-fns';
import { ChatRoom } from 'src/chat/entities/chat-room.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface CustomFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
// @UseFilters(new BaseWsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket']
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  constructor(
    private readonly chatService: ChatService,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>
  ) {}

  //입장
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@MessageBody() payload: { roomId: string; author: string; authorId: string }, @ConnectedSocket() socket: Socket) {
    socket.join(payload.roomId);  //유저를 룸에 추가
    this.logger.log(`Socket ${socket.id} joined room: ${payload.roomId}`);

    socket.data.roomId = payload.roomId; // socket.data에 roomId 설정
    socket.data.author = payload.author;
    socket.data.authorId = payload.authorId;

    await this.chatService.joinChatRoom(+payload.roomId, +payload.authorId);
    const resultImage = await this.chatService.findChatImage(+payload.roomId);

    if (resultImage) {
      const { findChatImage, findUser } = resultImage;
      //고정된 이미지 전송
      this.server.to(payload.roomId).emit('lastImage', { author: findUser.nickname, fileUrl: findChatImage.imgUrl });
    }

    //유저가 들어왔음을 알림
    this.server.to(payload.roomId).emit('userJoined', { message: `${payload.author} 님이 입장하셨습니다` });
  }

  //채팅 전송
  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() payload: { roomId: string; author: string; body: string }, socket: Socket) {
    this.logger.log(`Message received: ${payload.body}`);

    const isChatRoom = await this.chatService.isChatRoom(+payload.roomId);

    if(isChatRoom) {
      const currentTime = Date.now();
      const chatTime = format(currentTime, 'HH:mm');
      
      this.server.to(payload.roomId).emit('chat', {author: payload.author, body: payload.body, chatTime});
      this.chatService.chatHashtag(payload.body);

      //채팅방 update
      await this.chatRoomRepository.update(
        {id: +payload.roomId},
        {updatedAt: new Date(Date.now()) }
      );

      return payload;
    } else {
      this.server.to(payload.roomId).emit('outRoom', {});
    }
  }

  //이미지 전송
  @SubscribeMessage('chatImage')
  async handleImage(@MessageBody() payload: { roomId: string; author: string; fileUrl: string }, @ConnectedSocket() socket: Socket) {
    this.logger.log(`Message received: ${payload.fileUrl}`);

    const isChatRoom = await this.chatService.isChatRoom(+payload.roomId);

    if (isChatRoom) {
      const imageTime = await this.chatService.imageTime(+payload.roomId, payload.author, payload.fileUrl);

      this.server.to(payload.roomId).emit('chatImage', { author: payload.author, fileUrl: payload.fileUrl, imageTime });
      return payload;
    } else {
      this.server.to(payload.roomId).emit('outRoom', {});
    }
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  @UseFilters(new BaseWsExceptionFilter())
  //나가기
  async handleDisconnect(socket: Socket) {
    try {
      this.logger.log(`Socket disconnected: ${socket.id}`);

      const { roomId, author, authorId } = socket.data;
      console.log(socket.data);

      socket.leave(roomId);

      const checkChatOwner = await this.chatService.checkChatOwner(+roomId, +authorId);

      //방장인 경우
      if (checkChatOwner == true) {
        await this.chatService.outChatRoom(+roomId, +authorId);
        this.server.to(roomId).emit('ownerLeft', {});
      } else {    //방장이 아닌 경우
        await this.chatService.outChatRoom(+roomId, +authorId);
        this.server.to(roomId).emit('userLeft', { message: `${author} 님이 퇴장하셨습니다` });
      }
    } catch (error) {
      return;
    }
  }
}