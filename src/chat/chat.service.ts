import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Like, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatMember } from './entities/chat-member.entity';
import moment from 'moment';
import { format, isSameDay } from 'date-fns';
import { ChatLog } from './entities/chat-log.entity';
import { AwsService } from 'src/aws/aws.service';
import { ChatImage } from './entities/chat-image.entity';
import { Order } from 'src/post/types/post-order.type';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,
    @InjectRepository(ChatLog)
    private readonly chatLogRepository: Repository<ChatLog>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ChatImage)
    private readonly chatImageRepository: Repository<ChatImage>,
    private readonly awsService: AwsService,
    private entityManager: EntityManager,
  ) {}
  
  //채팅방 생성자 (채팅방 오너) 체크

  async checkChatOwner(chatRoomId: number, authorId: number) : Promise<boolean>{

    const chatOwner = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId, userId: authorId}
    });

    return chatOwner ? true : false
  };

  //채팅방 생성

  async createChatRoom(user: User, createChatDto: CreateChatDto) {
    
    const newChatRoom = await this.chatRoomRepository.save({
      userId: user.id,
      title: createChatDto.title
    });

    //멤버에 방장 추가
    await this.chatMemberRepository.save({
      roomId: newChatRoom.id,
      userId: user.id
    });

    return newChatRoom;
  }

  //채팅방 전체 목록 조회

  async findChatRooms() {
    
    const chatRooms = await this.chatRoomRepository.find({
      relations: ['user'],
      where: {isDeleted: false},
      select: {
        id: true,
        user: {
          nickname: true,
        },
        title: true,
        createdAt: true,
      },
      order: {createdAt: 'DESC'}
    });

    const chatRoomsFormatted = chatRooms.map((room) => ({
      ...room,
      createdAt: format(new Date(room.createdAt), 'yyyy-MM-dd HH:mm')
    }));

    return chatRoomsFormatted;
  }

  //채팅방 삭제

  async removeChatRoom(chatRoomId: number, authorId: number) {

    const checkChatOwner = await this.checkChatOwner(chatRoomId, authorId);

    if(checkChatOwner == false) {
      throw new ForbiddenException(
        '채팅방 삭제 권한이 없습니다.'
      )
    };

    //채팅방 삭제 예정 컬럼 업데이트
    await this.chatRoomRepository.update(
      {id: chatRoomId}, {isDeleted: true}
    );
    
    return { message: '삭제예정 컬럼 업데이트 완료'};
  }

  //채팅방 입장

  async joinChatRoom(chatRoomId: number, authorId: number) {

    //100명 제한
    const checkJoin = await this.memberCount(chatRoomId);

    if(checkJoin.user_count >= 100) {
      throw new BadRequestException(
        '채팅 제한 인원 100명 이상으로 입장 하실 수 없습니다.'
      );
    };

    const chatRoom = await this.chatRoomRepository.findOne({
      where: {id: chatRoomId}
    });

    const newChatMember = await this.chatMemberRepository.save({
      roomId: chatRoom.id,
      userId: authorId,
    });

    return chatRoom;
  }

  //채팅방 나가기

  async outChatRoom(chatRoomId: number, authorId: number) {

    //채팅방 방장이면 나가기 -> 채팅방 삭제 로직으로 이동
    //즉 방장이 나가면 채팅방 폭파

    const checkChatOwner = await this.checkChatOwner(chatRoomId, authorId);

    if(checkChatOwner == true) {
      const removeChat = await this.removeChatRoom(chatRoomId, authorId);
      return removeChat;
    };

    const chatRoom = await this.chatRoomRepository.findOne({
      where: {id: chatRoomId}
    });

    const outChatMember = await this.chatMemberRepository.delete(
      {id:chatRoom.id, userId: authorId}
    );

    return outChatMember;
  }

  //채팅방 인원 계산

  async memberCount(chatRoomId: number) {

    const membercount = await this.chatMemberRepository.query(
      `select count(user_id) as user_count
        from chat_members
        group by room_id
        having room_id = ${chatRoomId};`
    );

    return membercount;
  }

  //채팅방 마지막 채팅 시간

  async chatLastTime(chatRoomId: number) {

    const chatLastTime = await this.chatLogRepository.findOne({
      where: {roomId: chatRoomId},
      select: {createdAt: true},
      order: {createdAt: 'DESC'}
    });

    const chatImageLastTime = await this.chatImageRepository.findOne({
      where: {roomId: chatRoomId},
      select: {createdAt: true},
      order: {createdAt: 'DESC'}
    });

    //아무 채팅 없음
    if(!chatLastTime && !chatImageLastTime) {
      return { 'message' : ' ' };
    };

    let formatTime: any;

    if(chatLastTime && !chatImageLastTime) {
      formatTime = format(new Date(chatLastTime.createdAt), 'yyyy-MM-dd HH:mm');
    } else if (!chatLastTime && chatImageLastTime) {
      formatTime = format(new Date(chatImageLastTime.createdAt), 'yyyy-MM-dd HH:mm');
    } else if (chatLastTime && chatImageLastTime) {
      const diffTime = chatLastTime.createdAt < chatImageLastTime.createdAt ? chatImageLastTime.createdAt : chatLastTime.createdAt;
      formatTime = format(new Date(diffTime), 'yyyy-MM-dd HH:mm');
    }

    //오늘인지 확인

    const chatDate = new Date(formatTime);
    const nowDate = new Date();

    const isToday = isSameDay(chatDate, nowDate);

    if(isToday === true) {
      const timeDifference = nowDate.getTime() - chatDate.getTime();

      const diffInMinutes = Math.floor(timeDifference / (1000 * 60));  //분단위 환산 1분
      const diffInHours = Math.floor(timeDifference / (1000 * 60 * 60));   //시간단위 환산 1시간

      if( diffInMinutes < 60 ) {
        return { 'message' : `${diffInMinutes}분 전` };
      } else {
        return { 'message' : `${diffInHours}시간 전` };
      }

    }else {
      return { 'message' : formatTime };
    }
  }

  //채팅방 채팅 내역 저장
  async sendChatRoom(chatRoomId: number, author: string, message: string) {

    const findUser = await this.userRepository.findOne({
      where: {nickname: author},
      select: {id : true}
    });
    
    await this.chatLogRepository.save({
      roomId: chatRoomId,
      content: message,
      memberId: findUser.id
    });
  }

  //채팅방 이미지 저장
  async sendImageRoom(chatRoomId: number, author: string, file: Express.Multer.File) {

    const findUser = await this.userRepository.findOne({
      where: {nickname: author},
      select: {id : true}
    });

    const [fileName, fileExt] = file.originalname.split('.');

    const fileUrl = await this.awsService.imageUploadToS3(
      // 업로드
      `${Date.now()}_${fileName}`, 
      'chats',
      file,
      fileExt
    );

    //디비 저장
    await this.chatImageRepository.save({
      roomId: chatRoomId,
      userId: findUser.id,
      imgUrl: fileUrl
    });

    return fileUrl;
  }

  //채팅방 검색
  async chatRoomSearch(title?: string, sort?: Order) {

    const findChatRoom = await this.chatRoomRepository.find({
      relations: ['user'],
      select: {
        id: true,
        user: {
          nickname: true,
        },
        title: true,
        createdAt: true,
      },
      where: {
        isDeleted: false,
        title: title ? Like(`%${title}%`) : Like('%%'),
      },
      order: {createdAt: sort ? sort : 'DESC'}
    });

    const chatRoomsFormatted = findChatRoom.map((room) => ({
      ...room,
      createdAt: format(new Date(room.createdAt), 'yyyy-MM-dd HH:mm')
    }));

    return chatRoomsFormatted;
  }

  //채팅방 진짜 삭제
  async deleteChatRoom() {

    //조인
    const findDeleteChat = await this.chatRoomRepository.find({
      where: {isDeleted: true},
      relations: ['chatImages'],
      select: {
       id: true,
       chatImages: {
        imgUrl: true,
       },
      }
,    });

    //ondelete로 채팅방 -> 내역/이미지/멤버 모두 삭제 됨
    for (const room of findDeleteChat) {
      await this.chatLogRepository.delete({roomId: room.id});
      await this.chatImageRepository.delete({roomId: room.id});
      await this.chatMemberRepository.delete({roomId: room.id});
      await this.chatRoomRepository.delete({id: room.id});
    };

    //s3삭제
    for (const chat of findDeleteChat) {
        for(const image of chat.chatImages) {
        await this.awsService.deleteImageFromS3(image.imgUrl);
      }
    };
  }
}