import { Injectable } from '@nestjs/common';
import { CreateHashtagDto } from './dto/create-hashtag.dto';
import { UpdateHashtagDto } from './dto/update-hashtag.dto';
import { ChatLog } from 'src/chat/entities/chat-log.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';

@Injectable()
export class HashtagService {
  constructor(
    @InjectRepository(Hashtag)
    private readonly hashTagRepository: Repository<Hashtag>,
    @InjectRepository(ChatLog)
    private readonly chatLogRepository: Repository<ChatLog>,
  ) {}

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

    // findChatLogs.forEach((content) => {

    //   this.hashTagRepository.save({
    //     hashtagItem: content.content.match(hashtagPattern)
    //   })
      
    // });
  }
}
