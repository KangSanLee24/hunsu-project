import { Module } from '@nestjs/common';
import { ChatGateway } from './events.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from 'src/chat/entities/chat-room.entity';
import { ChatMember } from 'src/chat/entities/chat-member.entity';
import { ChatLog } from 'src/chat/entities/chat-log.entity';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { ChatService } from 'src/chat/chat.service';
import { ChatImage } from 'src/chat/entities/chat-image.entity';
import { AwsModule } from 'src/aws/aws.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChatRoom, ChatMember, ChatLog, ChatImage, User]), UserModule, AuthModule, AwsModule],
  providers: [ChatGateway, ChatService]
})
export class EventsModule {}