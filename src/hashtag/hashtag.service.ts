import { Injectable } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { format } from 'date-fns';

@Injectable()
export class HashtagService {
  constructor(private readonly redisService: RedisService) {}

  //해시태그 주간 랭킹 조회
  async hashtagWeeklyRank() {
    const client = this.redisService.getClient();

    //상위 10개 조회
    const hashtagData = await client.zrevrange('hashtag', 0, 9, 'WITHSCORES');

    const data = [];
    for (let i = 0; i < hashtagData.length; i += 2) {
      const item = hashtagData[i];
      const count = hashtagData[i + 1];

      data.push({
        hashtag: item,
        count: count,
      });
    }

    return data;
  }

  //만료기간 해시태그 삭제
  async deleteHashtag() {
    const client = this.redisService.getClient();

    const currentDay = format(Date.now(), 'yyyy-MM-dd');

    //만료기간 날짜가 오늘보다 작은 해시태그 삭제
    const expireData = await client.hgetall('hashtag_expire');

    for (const [uniqueTag, expireTime] of Object.entries(expireData)) {
      if (expireTime < currentDay) {
        const tag = uniqueTag.split(':')[0];
        const score = await client.zincrby('hashtag', -1, tag);
        await client.hdel('hashtag_expire', uniqueTag);

        if (parseFloat(score) <= 0) {
          await client.zrem('hashtag', tag);
        }

        console.log(`delete expire hashtag: ${uniqueTag}`);
      }
    }
  }
}
