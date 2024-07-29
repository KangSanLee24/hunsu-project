import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMember } from './entities/chat-member.entity';
import { ChatLog } from './entities/chat-log.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMember, ChatLog, User]), UserModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
