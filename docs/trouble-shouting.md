### 트러블 슈팅 → README

## 1. Redis 중복 저장

기존에는 Redis에 저장 시, `원본 데이터`와 `원본 데이터_t`라는 중복 데이터가 저장되는 문제가 있었습니다. 코드를 변경하여 데이터가 중복 저장되는 문제를 해결하였습니다.

코드 수정 전

```bash
// 라이브러리 설치
$ npm i redis-json
```

```Typescript
 /* 게시글 목록 조회 API */
  async findAll(
    page: number,
    limit: number,
    category?: Category,
    sort?: Order,
    keyword?: string
  ) {
    // 1. redis 값 불러오기
    const subRedisClient = this.subRedisService.getClient();
    const redisJson = new RedisJson(subRedisClient, { prefix: 'cache:' }); // RedisJson이 prefix: 'cache' 이용해서 키 구별, TTL 작동 시 필요

    // 2. 검색 필터위한 조건, 캐시 키 생성
     const postKey = `post:${page}:${limit}:${category || 'all'}:${sort || 'default'}:${keyword || 'none'}`;

     // 3. redis에서 postKey값으로 검색
    const cachePost = await redisJson.get(postKey);

    // 4-1. 만약, 레디스에 데이터가 있을 때
    if (cachePost) {
      console.log(`redis에서 가져옴 : ${cachePost}`);
      return cachePost;
      // 4-2. Redis에 데이터가 없을 경우 : DB에서 조회
    } else {
      // 카테고리에 따른 정렬
      const sortCategory = category ? { category } : {};

      // 검색어 조건 추가
      const keywordFilter = keyword ? { title: Like(`%${keyword}%`) } : {};
      // paginate 적용. items는 내용, meta는 페이지 정보
      const { items, meta } = await paginate<Post>(
        this.postRepository,
        {
          page,
          limit,
        },
        {
          where: { ...sortCategory, ...keywordFilter },
          relations: ['user', 'comments'],
          order: { createdAt: sort ? sort : 'DESC' }, // 정렬조건
          select: {
            id: true,
            userId: true,
            title: true,
            category: true,
            createdAt: true,
            updatedAt: true,
            user: {
              nickname: true,
            },
            comments: {
              id: true,
            },
          },
        }
      );
      // 4-3
      const result = {
        posts: items.map((post) => ({
          id: post.id,
          userId: post.userId,
          nickname: post.user.nickname,
          title: post.title,
          numComments: post.comments.length, // 댓글 수 배열로 표현됨
          category: post.category,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
        meta,
      };


      // 4-4. redis에 저장
      await redisJson.set(postKey, result); // 값 저장
      await subRedisClient.expire(`cache:${postKey}`, 120); // ttl 2분 설정

      return result;
    }
```

1. redis 값 불러오기 : `subRedisClient` 를 이용해 Redis클라이언트를 가져와 Redis 서버와 상호작용합니다. `redisJson` 객체를 생성합니다. `predix: 'cache:'` 는 Redis에 저장할 키에 `cache:` 를 붙여 구별하는데 사용하였습니다.
2. 검색 필터위한 조건, 캐시 키 생성 : `postKey` 를 생성하여 현재 페이지, 게시글 제한 수, 카테고리, 정렬 방식, 검색어 등을 포함한 캐시키를 생성하고 이 키를 사용하여 Redis에서 데이터를 검색하거나 저장합니다.
3. redis에서 postKey값으로 검색 : `redisJson.get(postKey)` 는 `postKey` 에 해당하는 값을 가져오며 데이터가 문자열 형태로 반환됩니다.
4. 만약, 레디스에 데이터가 존재하는 경우 : Redis에서 가져온 데이터인지 확인 할 수 있게 콘솔에 로그를 찍고 데이터를 반환합니다.
5. 만약, 레디스에 데이터가 존재하지 않는 경우 : DB에서 게시글을 조회하여 items와 meta를 가져옵니다. 카테고리, 정렬방식, 검색어를 기반으로 쿼리를 작성하여 게시글 목록을 가져옵니다. 조회된 게시글 데이터를 result **객체**로 가공합니다.
6. Redis에 데이터 저장 : `redisJSON.set(postKey, result)` 를 사용하여 result 객체를 JSON 문자열로 변환합니다. `subRedisClient.expire('cache:${postKey}', 120);` 는 `postKey` 에 대한 TTL(Time To Live) 값을 120초로 설정하여 캐시의 유효 기간을 지정합니다.

### **문제 발생**

1. redisJson을 이용해서 코드를 작성 하였으나 \_t라는 이름으로 붙은 또 다른 내용이 담긴 레디스 항목이 생성되어짐.
2. `predix: 'cache:'` , `subRedisClient.expire('cache:${postKey}', 120);` 수정시 TTL 값을 불러오지 못하는 상황이 발생하였습니다.
   ![[스크린샷 2024-08-15 104129.png]]

코드 수정 후

```bash
// 라이브러리 사용하지 않음
$ npm uninstall redis-json
```

기존에 만들어 둔 함수를 사용하는 방식으로 코드 수정

```Typescript
// redis/sub.redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SubRedisService implements OnModuleInit, OnModuleDestroy {
  private subRedisClient: Redis;

  constructor(private configService: ConfigService) {}

  /** Redis 모듈 시작 **/
  async onModuleInit() {
    const redisHost = this.configService.get<string>('SUB_REDIS_HOST');
    const redisPort = this.configService.get<number>('SUB_REDIS_PORT');
    const redisUser = this.configService.get<string>('SUB_REDIS_USER');
    const redisPassword = this.configService.get<string>('SUB_REDIS_PASSWORD');
    const redisTls = this.configService.get<string>('SUB_REDIS_TLS') === 'true';

    this.subRedisClient = new Redis({
      host: redisHost,
      port: redisPort || 14966,
      username: redisUser,
      password: redisPassword,
      tls: redisTls ? {} : undefined,
    });

    this.subRedisClient.on('connect', () => {
      console.log('Connected to SUB-Redis');
    });

    this.subRedisClient.on('error', (err) => {
      console.error('SUB-Redis error', err);
    });
  }

  /** Redis 모듈 종료 **/
  async onModuleDestroy() {
    await this.subRedisClient.quit();
  }

  /** Redis GET **/
  async getValue(key: string): Promise<string | null> {
    return this.subRedisClient.get(key);
  }

  /** Redis SET **/
  async setValue(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.subRedisClient.set(key, value, 'EX', ttl);
    } else {
      await this.subRedisClient.set(key, value);
    }
  }

  /** Redis DEL **/
  async deleteValue(key: string): Promise<number> {
    return this.subRedisClient.del(key);
  }

    /** 클라이언트 함수 **/
  getSubClient(): Redis | undefined {
    return this.subRedisClient;
  }
}

```

getValue, setValue, deleteValue 함수를 사용하는 방식

```Typescript
// src/post/post.service.ts

/* 게시글 목록 조회 API */
  async findAll(
    page: number,
    limit: number,
    category?: Category,
    sort?: Order,
    keyword?: string
  ) {
    // 1. 검색 필터위한 조건, 캐시 키 생성
    const postKey = `post:${page}:${limit}:${category || 'all'}:${sort || 'default'}:${keyword || 'none'}`;

    // 2. redis에서 postKey값으로 검색
    const cachePost = await this.subRedisService.getValue(postKey);

    // 3-1. 만약, 레디스에 데이터가 있을 때
    if (cachePost) {
      const parsedResult = JSON.parse(cachePost);
      return parsedResult;
      // 3-2. Redis에 데이터가 없을 경우 : DB에서 조회
    } else {
      // 카테고리에 따른 정렬
      const sortCategory = category ? { category } : {};
      // 검색어 조건 추가
      const keywordFilter = keyword ? { title: Like(`%${keyword}%`) } : {};
      // paginate 적용. items는 내용, meta는 페이지 정보
      const { items, meta } = await paginate<Post>(
        this.postRepository,
        {
          page,
          limit,
        },
        {
          where: { ...sortCategory, ...keywordFilter },
          relations: ['user', 'comments'],
          order: { createdAt: sort ? sort : 'DESC' }, // 정렬조건
          select: {
            id: true,
            userId: true,
            title: true,
            category: true,
            createdAt: true,
            updatedAt: true,
            user: {
              nickname: true,
            },
            comments: {
              id: true,
            },
          },
        }
      );

      // 4-3
      const result = {
        posts: items.map((post) => ({
          id: post.id,
          userId: post.userId,
          nickname: post?.user?.nickname,
          title: post.title,
          numComments: post.comments.length, // 댓글 수 배열로 표현됨
          category: post.category,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })),
        meta,
      };

      // 4-4. redis에 저장
      const stringifiedResult = JSON.stringify(result);
      await this.subRedisService.setValue(postKey, stringifiedResult, 120); //값저장

      return result;
    }
  }
```

1. 검색 필터 위한 조건, 캐시 키 생성 : `postKey` 를 생성하여 현재 페이지, 게시글 제한 수, 카테고리, 정렬 방식, 검색어 등을 포함한 캐시키를 생성하고 이 키를 사용하여 Redis에서 데이터를 검색하거나 저장합니다.
2. redis에서 postKey값으로 검색 : `this.subRedisService.getValue(postKey)` 를 사용하여 Redis에서 `postKey` 에 해당하는 값을 검색합니다.
3. 만약, 레디스에 데이터가 존재하는 경우 : Redis에서 데이터를 찾으면, `JSON.parse(cachePost)` 를 통해 **문자열**로 저장된 JSON 데이터를 **객체**로 변환합니다. 변환된 데이터는 API의 응답으로 반환됩니다.
4. 만약, 레디스에 데이터가 존재하지 않는 경우 : DB에서 게시글을 조회하여 items와 meta를 가져옵니다. 카테고리, 정렬방식, 검색어를 기반으로 쿼리를 작성하여 게시글 목록을 가져옵니다. 조회된 게시글 데이터를 result**객체**로 가공합니다.
5. Redis에 데이터 저장 : `JSON.stringify(result)` 를 사용하여 result 객체를 JSON 문자열로 변환합니다. 이 문자열을 `setValue` 를 이용해 Redis에 저장하고, TTL(Time To Live) 값을 120초로 설정하여 캐시의 유효 기간을 지정합니다.

---

### 게시글 생성과 관련된 API를 변경→ README

**게시글 생성 API - 이미지 업로드 API - 게시글 수정 API**

**다수의 이미지 업로드 로직 해결**

**상황**

**게시글 생성으로 return postId → 이미지 업로드 API를 호출할 수 있다.**

**프론트 개발 중 Toast UI Editor를 추가하면서, 이미지 첨부시 base64로 인코딩되어 길게 나온다.**

**변경**

**그냥 일단 AWS S3 올려 그리고 url 받아. 그걸로 미리보기 띄워.**

**나중에 런치면 우리가 뒤처리하지 뭐…**

**지금 로직은 구리다...이거 적어야되나…**

**선택한 파일 위치만 일단 저장하고 미리보기 보여주고, files이런식으로 추가해놨다가 게시글 생성 API와 이미지 업로드 API를 동기적으로 처리했어도 됬는데….**

### 문제

### 해결 방법

### 결과

---

### 포인트 제도 관련 트러블 슈팅 → 수정 필요

**아래 양식에 맞게 수정 필요**

### 문제

### 해결 방법

### 결과

## 1. 포인트 제도란?

- 특정한 행동을 취하면 얻게 되는 점수 제도로,

## 2. 일일 퀘스트

<img src="docs/브로셔트러블슈팅빽업사진2.png" width="80%">

- `일일퀘스트`가 존재하며, 하루 동안 얻을 수 있는 포인트 조건을 나타냅니다.
- `현재횟수/ 최대횟수`가 표기되며, 로그인하면 `출석체크 API`가 호출되어 20점을 획득합니다.

## 3. 유저 피드백

- 처음에 일일 퀘스트를 표시하는 곳에서 -가 나온다, 갱신이 안된다.

## 4. 트러블 슈팅

일일퀘스트 로직 작성 중 일어났던 트러블 슈팅 정리.

- 기존 로직

1. 게시글/댓글 작성, 게시글/댓글 좋아요 생성 이벤트마다 횟수 +1 및 포인트 가산
2. 게시글/댓글 삭제, 게시글/댓글 좋아요 삭제 이벤트마다 횟수 -1 및 포인트 감산

- 결과 및 1차 수정

결과 - 유저테스트 중 일일퀘스트 게시글 쪽이 음수로 표기되는 경우가 제보됨.
첫 설계에서 포인트를 얻는 방법은 일일퀘스트 횟수에 국한되어 있기에
가산되는 포인트는 그 한도와 횟수가 정해져있지만,
삭제시 감산되는 로직은 그 동안 작성했던 모든 게시글, 댓글에 해당되어
이전에 작성했던 게시글/댓글 역시 삭제 시에 횟수-1, 포인트 감산이 되어
횟수와 포인트에 음수 값이 나타나는 문제 발생

수정 - 횟수 또는 포인트에 음수가 표기될 시, 강제로 0에 고정시켜 버리는 로직 추가

- 결과 및 2차 수정

결과 - FrontEnd에는 음수가 나오면 0으로 잘 표시되지만,
BackEnd에서는 횟수 마이너스 및 포인트 마이너스가 진행되고 Redis, DB에 저장되어
만일, 글 생성 3번, 삭제 3번이면 포인트 가산은 횟수 2번까지만 적용되지만 삭제는
3번 모두 적용되어 Redis, DB에서는 이미 마이너스로 저장이 됨.
결국 FrontEnd에 나타나는 포인트 및 일일퀘스트 횟수와 실제 저장된 데이터 간에
괴리가 생기게 됨.

수정 - 감산 로직과 가산 로직의 모든 경우의 수를 고려하여 설계하기엔 복잡성, 시간 소요가 많다고 판단, 감산 로직을 -0으로 결정.

---

## Redis 모듈을 병렬적으로 개발하다 생긴 문제 → readme에도 작성

### 문제

Redis 클라우드 서버를 2대로 늘려야 하는 상황
아래와 같은 구조로 설계했을 때, 각각 클라이언트에 연결 과정에서 클라이언트를 둘 다 못 찾는 문제가 발생

```tree
src/
├── redis/
│ ├── redis.module.ts
│ ├── redis.service.ts
│── subredis/
│ ├── subredis.module.ts
│ ├── subredis.service.ts
```

### 해결방법

- redis 모듈 1개, 서비스 2개의 구조로 변경

```tree
src/
├── redis/
│   ├── redis.module.ts
│   ├── redis.service.ts
│   └── sub.redis.services.ts
```

### 결과

- 두 개의 클라이언트에 모두 정상적으로 연결 됨을 확인

---
