import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat/chat.service';

interface CustomFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');

  constructor(private readonly chatService: ChatService) {}

  //입장
  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() payload: { roomId: string; author: string; }, @ConnectedSocket() socket: Socket) {
    socket.join(payload.roomId);  //유저를 룸에 추가
    this.logger.log(`Socket ${socket.id} joined room: ${payload.roomId}`);

    //유저가 들어왔음을 알림
    this.server.to(payload.roomId).emit('userJoined', {message: `${payload.author} 님이 입장하셨습니다`});
  }

  //나가기
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() { roomId }: { roomId: string }, @ConnectedSocket() socket: Socket) {
    socket.leave(roomId);
    this.logger.log(`Socket ${socket.id} left room: ${roomId}`);
    // Optional: Notify the room when a user leaves
  }

  //채팅 전송
  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() payload: { roomId: string; author: string; body: string }, socket: Socket) {
    this.logger.log(`Message received: ${payload.body}`);

    await this.chatService.sendChatRoom(+payload.roomId, payload.author, payload.body);

    this.server.to(payload.roomId).emit('chat', {author: payload.author, body: payload.body});
    return payload;
  }

  //이미지 전송
  @SubscribeMessage('chatImage')
  async handleImage(@MessageBody() payload: { roomId: string; author: string; fileUrl: string }, @ConnectedSocket() socket: Socket) {
    this.logger.log(`Message received: ${payload.fileUrl}`);

    this.server.to(payload.roomId).emit('chatImage', {author: payload.author, fileUrl: payload.fileUrl });
    return payload;
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}