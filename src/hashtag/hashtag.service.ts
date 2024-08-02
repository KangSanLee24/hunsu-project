import { Injectable } from '@nestjs/common';
import { ChatLog } from 'src/chat/entities/chat-log.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { HashtagFromType } from './types/hashtag-from.type';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashTagRepository: Repository<Hashtag>,
    @InjectRepository(ChatLog)
    private readonly chatLogRepository: Repository<ChatLog>,
  ) {}

  //해시태그 카운트 계산
  async hashtagCount() {

    const hashtagCount = await this.hashTagRepository.query(
      `select hashtag_item , count(*) as count
      from hashtags
      group by hashtag_item;`
    );

    return hashtagCount;
  }

  //해시태그 생성
  async createHashtags() {
    
    const nowDate = new Date();
    const findChatDate = new Date(nowDate.setMinutes(nowDate.getMinutes() -1 ));

    const findChatLogs = await this.chatLogRepository.find({
      where: {
        createdAt: MoreThan(findChatDate),
        content: Like('%#%')},
      select: {content: true, memberId: true, roomId: true},
    });

    const hashtagPattern = /#\S+/g;

    for ( const chat of findChatLogs ) {
      const newHashtag = await this.hashTagRepository.save({
        hashtagItem: String(chat.content.match(hashtagPattern)),
        userId: chat.memberId,
        hashtagType: HashtagFromType.CHAT
      })
    };
  }
  
}
