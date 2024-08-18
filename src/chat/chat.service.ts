import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatRoom } from './entities/chat-room.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Like, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { ChatMember } from './entities/chat-member.entity';
import { format, isSameDay } from 'date-fns';
import { AwsService } from 'src/aws/aws.service';
import { ChatImage } from './entities/chat-image.entity';
import { Order } from 'src/post/types/post-order.type';
import { Point } from 'src/point/entities/point.entity';
import { RedisService } from 'src/redis/redis.service';
import { AlarmService } from 'src/alarm/alarm.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly redisService: RedisService,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepository: Repository<ChatMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(ChatImage)
    private readonly chatImageRepository: Repository<ChatImage>,
    private readonly awsService: AwsService,
    private readonly alarmService: AlarmService,
    private entityManager: EntityManager
  ) {}

  //채팅방 생성자 (채팅방 오너) 체크

  async checkChatOwner(chatRoomId: number, authorId: number): Promise<boolean> {
    const chatOwner = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId, userId: authorId },
    });

    return chatOwner ? true : false;
  }

  //채팅방 생성

  async createChatRoom(user: User, createChatDto: CreateChatDto) {
    const newChatRoom = await this.chatRoomRepository.save({
      userId: user.id,
      title: createChatDto.title,
    });

    return newChatRoom;
  }

  //채팅방 전체 목록 조회

  async findChatRooms() {
    const chatRooms = await this.chatRoomRepository.find({
      relations: ['user'],
      where: { isDeleted: false },
      select: {
        id: true,
        user: {
          nickname: true,
        },
        title: true,
        createdAt: true,
      },
      order: { createdAt: 'DESC' },
    });

    const chatRoomsFormatted = chatRooms.map((room) => ({
      ...room,
      createdAt: format(new Date(room.createdAt), 'yyyy-MM-dd HH:mm'),
    }));

    return chatRoomsFormatted;
  }

  //채팅방 삭제

  async removeChatRoom(chatRoomId: number, authorId: number) {
    const checkChatOwner = await this.checkChatOwner(chatRoomId, authorId);

    if (checkChatOwner == false) {
      throw new ForbiddenException('채팅방 삭제 권한이 없습니다.');
    }

    //채팅방 삭제 예정 컬럼 업데이트
    await this.chatRoomRepository.update(
      { id: chatRoomId },
      { isDeleted: true }
    );

    return { message: '삭제예정 컬럼 업데이트 완료' };
  }

  //채팅방 입장

  async joinChatRoom(chatRoomId: number, authorId: number) {
    //100명 제한
    const checkJoin = await this.memberCount(chatRoomId);

    if (checkJoin.user_count >= 100) {
      throw new BadRequestException(
        '채팅 제한 인원 100명 이상으로 입장 하실 수 없습니다.'
      );
    }

    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
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

    if (checkChatOwner == true) {
      await this.removeChatRoom(chatRoomId, authorId);
    } else {
      await this.chatMemberRepository.delete({
        roomId: chatRoomId,
        userId: authorId,
      });
    }
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
    const chatLastTime = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
      select: { updatedAt: true },
      order: { updatedAt: 'DESC' },
    });

    const chatImageLastTime = await this.chatImageRepository.findOne({
      where: { roomId: chatRoomId },
      select: { createdAt: true },
      order: { createdAt: 'DESC' },
    });

    let formatTime: any;

    if (chatLastTime && !chatImageLastTime) {
      formatTime = format(new Date(chatLastTime.updatedAt), 'yyyy-MM-dd HH:mm');
    } else if (chatLastTime && chatImageLastTime) {
      const diffTime =
        chatLastTime.updatedAt < chatImageLastTime.createdAt
          ? chatImageLastTime.createdAt
          : chatLastTime.updatedAt;
      formatTime = format(new Date(diffTime), 'yyyy-MM-dd HH:mm');
    }

    //오늘인지 확인

    const result = await this.chatRoomRepository.query(
      'SELECT NOW() as currentTime'
    );
    const dbTime = new Date(result[0].currentTime);

    const chatDate = new Date(formatTime);

    const isToday = isSameDay(chatDate, dbTime);

    if (isToday === true) {
      const timeDifference = dbTime.getTime() - chatDate.getTime();

      const diffInMinutes = Math.floor(timeDifference / (1000 * 60)); //분단위 환산 1분
      const diffInHours = Math.floor(timeDifference / (1000 * 60 * 60)); //시간단위 환산 1시간

      if (diffInMinutes < 60) {
        return { message: `${diffInMinutes}분 전` };
      } else {
        return { message: `${diffInHours}시간 전` };
      }
    } else {
      return { message: formatTime };
    }
  }

  //채팅방 채팅 내역 저장
  // async sendChatRoom(chatRoomId: number, author: string, message: string) {
  //   const findUser = await this.userRepository.findOne({
  //     where: { nickname: author },
  //     select: { id: true },
  //   });

  //   const chatLog = await this.chatLogRepository.save({
  //     roomId: chatRoomId,
  //     content: message,
  //     memberId: findUser.id,
  //   });

  //   const chatTime = format(new Date(chatLog.createdAt), 'HH:mm');

  //   return chatTime;
  // }

  //채팅 내역 중 해시태그 레디스 저장
  async chatHashtag(chat: string) {
    const client = this.redisService.getClient();

    const hashtagPattern = /#\S+/g;
    const hashtagitem = chat.match(hashtagPattern);

    const currentTime = Date.now();
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7일을 밀리초로 변환
    const expireTime = format(
      currentTime + sevenDaysInMilliseconds,
      'yyyy-MM-dd'
    );

    if (hashtagitem) {
      for (const tag of hashtagitem) {
        const uniqueTag = `${tag}:${currentTime}`;

        // ZINCRBY 이전 데이터
        const zBefore = await client.zrevrange('hashtag', 0, 9, 'WITHSCORES');

        // 해시태그 카운트 1 증가 (해시태그 명단에 없으면 새로 생성)
        client.zincrby('hashtag', 1, tag);

        // ZINCRBY 이후 데이터
        const zAfter = await client.zrevrange('hashtag', 0, 9, 'WITHSCORES');

        // TOP10 변동이 있는 경우에만 이벤트 등록
        if (zBefore.join() !== zAfter.join()) {
          // 이벤트 등록
          const alarmData = {
            type: 'hashtag',
            message: `${tag}`,
            data: zAfter,
          };
          this.alarmService.newEventRegister(0, alarmData);
        }

        //만료기간을 따로 저장
        client.hset('hashtag_expire', uniqueTag, expireTime);
        console.log(`redis : chat-hashtag ${tag}`);
      }
    }
  }

  //채팅방 이미지 저장
  async sendImageRoom(
    chatRoomId: number,
    author: string,
    file: Express.Multer.File
  ) {
    const findUser = await this.userRepository.findOne({
      where: { nickname: author },
      select: { id: true },
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
      imgUrl: fileUrl,
    });

    return fileUrl;
  }

  //이미지 시간 조회
  async imageTime(roomId: number, author: string, fileUrl: string) {
    const findUser = await this.userRepository.findOne({
      where: { nickname: author },
      select: { id: true },
    });

    const imageLog = await this.chatImageRepository.findOne({
      where: { roomId: roomId, userId: findUser.id, imgUrl: fileUrl },
      select: { createdAt: true },
    });

    const imageTime = format(new Date(imageLog.createdAt), 'HH:mm');

    return imageTime;
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
      order: { createdAt: sort ? sort : 'DESC' },
    });

    const chatRoomsFormatted = findChatRoom.map((room) => ({
      ...room,
      createdAt: format(new Date(room.createdAt), 'yyyy-MM-dd HH:mm'),
    }));

    return chatRoomsFormatted;
  }

  //채팅방 진짜 삭제
  async deleteChatRoom() {
    //조인
    const findDeleteChat = await this.chatRoomRepository.find({
      where: { isDeleted: true },
      relations: ['chatImages'],
      select: {
        id: true,
        chatImages: {
          imgUrl: true,
        },
      },
    });

    //트랜잭션
    //로그, 이미지, 멤버, 방 삭제
    //격리수준 -READ UNCOMMITED -> 트랜잭션 중 다른 데이터 삽입 가능
    //2024-08-13 채팅 내역 테이블 삭제 (레디스로 이동)

    await this.entityManager.transaction(
      'READ UNCOMMITTED',
      async (manager) => {
        try {
          for (const room of findDeleteChat) {
            await manager.delete(ChatImage, { roomId: room.id });
            await manager.delete(ChatMember, { roomId: room.id });
            await manager.delete(ChatRoom, { id: room.id });
          }

          // 트랜잭션이 성공했을 때 S3 삭제
          await Promise.all(
            findDeleteChat.map(async (chat) => {
              for (const image of chat.chatImages) {
                await this.awsService.deleteImageFromS3(image.imgUrl);
              }
            })
          );
        } catch (error) {
          console.error('트랜잭션 중 오류 발생:', error);
        }
      }
    );
  }

  //랭킹 (숫자 입력 가능)
  async getHotLiveChat(num: number) {
    const getHotLiveChat = await this.entityManager.query(
      `
      select a.id, a.owner_id, a.title, a.count,
      CASE
      when b.user_id = a.owner_id then b.img_url
      ELSE null
      END as img_url
      from (select a.id, a.user_id as owner_id, a.title, count(b.user_id) as count
      from (select id, user_id ,title
      from chat_rooms
      where is_deleted = FALSE) a join chat_members b
      on a.id  = b.room_id
      GROUP by a.id
      order by count DESC) a left join
      (select room_id , user_id, img_url
      from chat_Images
      where (room_id, created_at) IN
      (select room_id , max(created_at)
      from chat_Images
      group by room_id)) b
      on a.id = b.room_id;
      `
    );

    const data = await Promise.all(
      getHotLiveChat.map(async (chat: any) => {
        const user = await this.userRepository.findOneBy({
          id: chat.owner_id,
        });
        const point = await this.pointRepository.findOneBy({
          userId: chat.owner_id,
        });
        return {
          id: chat.id,
          ownerId: chat.owner_id,
          nickname: user.nickname,
          point: point.accPoint,
          title: chat.title,
          count: chat.count,
          imgUrl: chat.img_url,
        };
      })
    );
    return data;
  }

  //마지막 고정 이미지
  async findChatImage(chatRoomId: number) {
    const findChatImage = await this.chatImageRepository.findOne({
      where: { roomId: chatRoomId },
      select: {
        userId: true,
        imgUrl: true,
      },
      order: { createdAt: 'DESC' },
    });

    if (findChatImage) {
      const findUser = await this.userRepository.findOne({
        where: { id: findChatImage.userId },
        select: { nickname: true },
      });

      return { findChatImage, findUser };
    } else {
      return null;
    }
  }

  //죽은 방인지 확인
  async isChatRoom(chatRoomId: number) {
    const isChatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId, isDeleted: false },
    });

    return isChatRoom;
  }
}
