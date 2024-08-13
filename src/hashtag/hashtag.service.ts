import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';

@Injectable()
export class HashtagService {
  constructor(
    private readonly redisService : RedisService,
  ) {}
  
  // //해시태그 주간 랭킹 조회
  // async hashtagWeeklyLank(num: number) {
  //   const hashtagCount = await this.hashTagRepository.query(
  //     `select hashtag_item , count(*) as count
  //     from hashtags
  //     where created_at >= NOW() - INTERVAL 7 DAY
  //     group by hashtag_item
  //     order by count DESC
  //     limit ${num};`
  //   );

  //   const data = hashtagCount.map((hashtag) => ({
  //     hashtag: hashtag.hashtag_item,
  //     count: hashtag.count,
  //   }));

  //   return data;
  // }

  // //해시태그 생성 (스케줄러)
  // async createHashtags() {
  //   // DB 시간 가져오기
  //   const result = await this.chatLogRepository.query(
  //     'SELECT NOW() as currentTime'
  //   );
  //   const dbTime = new Date(result[0].currentTime);
  //   const oneMinutesAgo = new Date(dbTime.getTime() - 1 * 60 * 1000);

  //   const findChatLogs = await this.chatLogRepository.find({
  //     where: {
  //       createdAt: MoreThan(oneMinutesAgo),
  //       content: Like('%#%'),
  //     },
  //     select: { content: true, memberId: true, roomId: true },
  //   });

  //   const hashtagPattern = /#\S+/g;

  //   for (const chat of findChatLogs) {
  //     const newHashtag = await this.hashTagRepository.save({
  //       hashtagItem: String(chat.content.match(hashtagPattern)),
  //       userId: chat.memberId,
  //       hashtagType: HashtagFromType.CHAT,
  //     });
  //   }
  // }

  //해시태그 주간 랭킹 조회
  async hashtagWeeklyLank() {
    const client = this.redisService.getClient();

    //상위 10개 조회
    const hashtagData = await client.zrevrange('hashtag', 0, 9, 'WITHSCORES');

    const data = [];
    for (let i=0; i < hashtagData.length; i+=2) {
      const item = hashtagData[i];
      const count = hashtagData[i+1];

      data.push({
        hashtag: item,
        count: count
      });
    }

    return data;
  }

  //만료기간 해시태그 삭제
  async deleteHashtag() {
    const client = this.redisService.getClient();

    const currentDay = format(Date.now(), 'yyyy-mm-dd');

    //만료기간 날짜가 오늘보다 작은 해시태그 삭제
    const expireData = await client.hgetall('hashtag_expire');

    for ( const [uniqueTag, expireTime] of Object.entries(expireData)) {
      if(expireTime < currentDay) {
        const hashitem = uniqueTag.split(':')[0];
        await client.zrem('hashtag', hashitem);
        await client.hdel('hashtag_expire', uniqueTag);

        console.log(`delete expire hashtag: ${hashitem}`);
      }
    }
  }
}
