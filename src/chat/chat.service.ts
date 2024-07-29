import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatMember } from './entities/chat-member.entity';
import moment from 'moment';
import { format } from 'date-fns';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>
  ) {}
  
  //채팅방 생성자 (채팅방 오너) 체크

  async checkChatOwner(id: number) {

    const chatOwner = await this.chatRoomRepository.findOne({
      where: {userId: id}
    });

    return chatOwner
  };

  //채팅방 생성

  async createChatRoom(user: User, createChatDto: CreateChatDto) {
    
    const newChatRoom = await this.chatRoomRepository.save({
      userId: user.id,
      title: createChatDto.title
    });

    await this.chatMemberRepository.save({
      roomId: newChatRoom.id,
      userId: user.id
    });

    return newChatRoom;
  }

  //채팅방 전체 목록 조회

  async findChatRooms() {
    
    const chatRooms = await this.chatRoomRepository.find({
      select: {
        id: true,
        user: {
          nickname: true,
        },
        title: true,
        createdAt: true,
      }
    });

    const chatRoomsFormatted = chatRooms.map((room) => ({
      ...room,
      createdAt: format(new Date(room.createdAt), 'YYYY-MM-DD HH:mm')
    }));

    return chatRoomsFormatted;
  }

  //채팅방 삭제

  async removeChatRoom(chatRoomId: number, user: User) {

    const checkChatOwner = this.checkChatOwner(user.id);

    if(!checkChatOwner) {
      throw new ForbiddenException(
        '채팅방 삭제 권한이 없습니다.'
      )
    };

    //채팅방멤버 삭제
    //채팅방 삭제
  }

  //채팅방 입장

  async joinChatRoom(chatRoomId: number, user: User) {

    const chatRoom = await this.chatRoomRepository.findOne({
      where: {id: chatRoomId}
    });

    const newChatMember = await this.chatMemberRepository.save({
      roomId: chatRoom.id,
      userId: user.id,
    });

    const resChat = {
      chatName: chatRoom.title,
      roomId: newChatMember.roomId,
      memberNickname: newChatMember.user.nickname
    };

    return resChat;
  }

  //채팅방 나가기

  async outChatRoom(chatRoomId: number, user: User) {

    //채팅방 생성자는 어떻게 할지?

    const chatRoom = await this.chatRoomRepository.findOne({
      where: {id: chatRoomId}
    });

    const outChatMember = await this.chatMemberRepository.delete(
      {id:chatRoom.id, userId: user.id}
    );

    return outChatMember;
  }
}
