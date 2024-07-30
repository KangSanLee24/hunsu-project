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

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() { roomId }: { roomId: string }, @ConnectedSocket() socket: Socket) {
    socket.join(roomId);
    this.logger.log(`Socket ${socket.id} joined room: ${roomId}`);
    // Optional: Notify the room when a new user joins
  }

  // @SubscribeMessage('leaveRoom')
  // handleLeaveRoom(@MessageBody() { roomId }: { roomId: string }, socket: Socket) {
  //   socket.leave(roomId);
  //   this.logger.log(`Socket ${socket.id} left room: ${roomId}`);
  //   // Optional: Notify the room when a user leaves
  // }

  @SubscribeMessage('chat')
  handleMessage(@MessageBody() payload: { roomId: string; author: string; body: string }, socket: Socket) {
    this.logger.log(`Message received: ${payload.body}`);
    this.server.to(payload.roomId).emit('chat', {author: payload.author, body: payload.body});
    return payload;
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Socket connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }
}