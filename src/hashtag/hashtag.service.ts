import { Injectable } from '@nestjs/common';
import { ChatLog } from 'src/chat/entities/chat-log.entity';
import { Like, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Hashtag } from './entities/hashtag.entity';
import { HashtagFromType } from './types/hashtag-from.type';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class HashtagService {
  constructor(
    private readonly redisService : RedisService,
    @InjectRepository(Hashtag)
    private readonly hashTagRepository: Repository<Hashtag>,
    @InjectRepository(ChatLog)
    private readonly chatLogRepository: Repository<ChatLog>
  ) {}

  //해시태그 주간 랭킹 조회
  async hashtagWeeklyLank(num: number) {
    const hashtagCount = await this.hashTagRepository.query(
      `select hashtag_item , count(*) as count
      from hashtags
      where created_at >= NOW() - INTERVAL 7 DAY
      group by hashtag_item
      order by count DESC
      limit ${num};`
    );

    const data = hashtagCount.map((hashtag) => ({
      hashtag: hashtag.hashtag_item,
      count: hashtag.count,
    }));

    return data;
  }

  //해시태그 생성 (스케줄러)
  async createHashtags() {
    // DB 시간 가져오기
    const result = await this.chatLogRepository.query(
      'SELECT NOW() as currentTime'
    );
    const dbTime = new Date(result[0].currentTime);
    const oneMinutesAgo = new Date(dbTime.getTime() - 1 * 60 * 1000);

    const findChatLogs = await this.chatLogRepository.find({
      where: {
        createdAt: MoreThan(oneMinutesAgo),
        content: Like('%#%'),
      },
      select: { content: true, memberId: true, roomId: true },
    });

    const hashtagPattern = /#\S+/g;

    for (const chat of findChatLogs) {
      const newHashtag = await this.hashTagRepository.save({
        hashtagItem: String(chat.content.match(hashtagPattern)),
        userId: chat.memberId,
        hashtagType: HashtagFromType.CHAT,
      });
    }
  }

  async getHashtag() {
    const client = this.redisService.getClient();
    const hashtag = await client.zrevrange('hashtag', 0, -1, 'WITHSCORES');

    return hashtag;
  }
}
