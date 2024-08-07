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
  async handleJoinRoom(@MessageBody() payload: { roomId: string; author: string; authorId: string }, @ConnectedSocket() socket: Socket) {
    socket.join(payload.roomId);  //유저를 룸에 추가
    this.logger.log(`Socket ${socket.id} joined room: ${payload.roomId}`);

    socket.data.roomId = payload.roomId; // socket.data에 roomId 설정
    socket.data.author = payload.author;  
    socket.data.authorId = payload.authorId; 

    await this.chatService.joinChatRoom(+payload.roomId, +payload.authorId);
    const resultImage = await this.chatService.findChatImage(+payload.roomId);

    if(resultImage) {
      const { findChatImage, findUser } = resultImage;
      //고정된 이미지 전송
      this.server.to(payload.roomId).emit('lastImage', {author: findUser.nickname, fileUrl: findChatImage.imgUrl });
    }

    //유저가 들어왔음을 알림
    this.server.to(payload.roomId).emit('userJoined', {message: `${payload.author} 님이 입장하셨습니다`});
  }

  //채팅 전송
  @SubscribeMessage('chat')
  async handleMessage(@MessageBody() payload: { roomId: string; author: string; body: string }, socket: Socket) {
    this.logger.log(`Message received: ${payload.body}`);

    const chatTime = await this.chatService.sendChatRoom(+payload.roomId, payload.author, payload.body);

    this.server.to(payload.roomId).emit('chat', {author: payload.author, body: payload.body, chatTime});
    return payload;
  }

  //이미지 전송
  @SubscribeMessage('chatImage')
  async handleImage(@MessageBody() payload: { roomId: string; author: string; fileUrl: string }, @ConnectedSocket() socket: Socket) {
    this.logger.log(`Message received: ${payload.fileUrl}`);

    const imageTime = await this.chatService.imageTime(+payload.roomId, payload.author, payload.fileUrl);

    this.server.to(payload.roomId).emit('chatImage', {author: payload.author, fileUrl: payload.fileUrl, imageTime });
    return payload;
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  //나가기
  async handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);

    const { roomId, author, authorId } = socket.data;
    console.log(socket.data);

    socket.leave(roomId);

    const checkChatOwner = await this.chatService.checkChatOwner(+roomId, +authorId);

    if(checkChatOwner == true) {
      await this.chatService.outChatRoom(+roomId, +authorId);
      this.server.to(roomId).emit('userLeft', { message: `방장 ${author} 님이 퇴장하셨습니다` });
    } else {
      await this.chatService.outChatRoom(+roomId, +authorId);
      this.server.to(roomId).emit('userLeft', { message: `${author} 님이 퇴장하셨습니다` });
    }
  }
  // //나가기
  // @SubscribeMessage('leftRoom')
  // async handleleftRoom(@MessageBody() payload: { roomId: string; author: string; authorId: number}, @ConnectedSocket() socket: Socket) {
    
  //   socket.leave(payload.roomId);

  //   const checkChatOwner = await this.chatService.checkChatOwner(+payload.roomId, +payload.authorId);

  //   if(checkChatOwner == true) {
  //     await this.chatService.outChatRoom(+payload.roomId, +payload.authorId);
  //     this.server.to(payload.roomId).emit('userLeft', { message: `방장 ${payload.author} 님이 퇴장하셨습니다` });
  //   } else {
  //     await this.chatService.outChatRoom(+payload.roomId, +payload.authorId);
  //     this.server.to(payload.roomId).emit('userLeft', { message: `${payload.author} 님이 퇴장하셨습니다` });
  //   }
  // }
}