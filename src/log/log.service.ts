import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { paginate } from 'nestjs-typeorm-paginate';
import {
  LogContextType,
  LogLevelType,
  LogMethodType,
  LogStatusCodeType,
} from './types/log.type';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>
  ) {}

  /** 로그 목록 조회(R-L) API **/
  async getAllLogs(
    page: number,
    limit: number,
    contextType: LogContextType,
    levelType: LogLevelType,
    statusCodeType: LogStatusCodeType,
    methodType: LogMethodType,
    userId: number,
    keyword: string,
    time: Date
  ) {
    // 0. 데이터 정리
    // const context = contextType ? { context: contextType } : {};
    const level = levelType ? { level: levelType } : {};
    // const resStatus = statusCodeType ? { resStatus: Like(`%{}`) } : {};
    const reqMethod = methodType ? { reqMethod: methodType } : {};
    const user = userId ? { userId: userId } : {};
    const keywordFilter = keyword ? { userAgent: Like(`%${keyword}`) } : {};
    // const timeFilter = time ? { createdAt: Like(`${time}%`) } : {}; // 안된다...

    // 1. 페이지네이션을 적용한 로그 목록 조회
    const { items, meta } = await paginate<Log>(
      this.logRepository,
      {
        page,
        limit,
      },
      {
        where: {
          //   ...context,
          ...level,
          //   ...resStatus,
          ...reqMethod,
          ...user,
          ...keywordFilter,
          // timeFilter 추가 어떻게 하는지 알아보기
        },
        order: { timestamp: 'DESC' },
        select: {
          id: true,
          context: true,
          level: true,
          message: true,
        },
      }
    );

    // 2. 반환
    return {
      logs: items.map((log) => ({
        id: log.id,
        context: log.context,
        level: log.level,
        message: log.message,
      })),
      meta,
    };
  }

  /** 로그 상세 조회(R-D) API **/
  async getOneLog(logId: number) {
    // 1. 상세 조회할 로그 찾기
    const log = await this.logRepository.findOneBy({ id: logId });
    // 1-1. 찾을 수 없는 경우
    if (!log) {
      throw new NotFoundException('로그가 존재하지 않습니다.');
    }

    // 2. 로그 반환
    return log;
  }

  /** 로그 삭제(D) API **/
  async deleteOneLog(logId: number) {
    // 1. 삭제할 로그 찾기
    const log = await this.logRepository.findOneBy({
      id: logId,
    });
    // 1-1. 찾을 수 없는 경우
    if (!log) {
      throw new NotFoundException('로그가 존재하지 않습니다.');
    }

    // 2. 삭제하기
    await this.logRepository.delete({
      id: logId,
    });

    // 3. 데이터 가공
    const data = {
      id: logId,
    };

    // 4. 반환
    return data;
  }

  /** 로그 DB전송(C) API **/
  async insertLogs() {
    // 1. API 실행 시점을 기준으로 전송할 로그파일명 확정
    const logFileName = `2024-08-21-20.log`;
    console.log(logFileName);

    const logFilePath = path.resolve(__dirname, `../../logs/${logFileName}`);
    console.log(logFilePath);

    // 2. 로그파일을 분해하여 데이터 뽑아오기
    const logs = fs
      .readFileSync(logFilePath, 'utf8')
      .split('\n')
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line));
    // 컬럼: context, level, message,
    // reqMethod, reqOriginalUrl, resDuration, resStatus,
    // userId, userIp, userAgent, createdAt

    const data = logs.map((e) => {
      if (e.context == 'UserRequest') {
        // 1. 사용자 요청 로그인 경우
        const dataArray = e.message.split('][');
        const userId = dataArray[0].split('|')[1];
        const userIp = dataArray[1].split('|')[1];
        const reqMethod = dataArray[2].split('|')[1];
        const resStatus = dataArray[3].split('|')[1];
        const resDuration = dataArray[4].split('|')[1];
        const reqOriginalUrl = dataArray[5].split('|')[1];
        const userAgent = dataArray[6].split('|')[1];
        return {
          context: e.context,
          level: e.level,
          message: e.message,
          timestamp: e.timestamp,
          data: {
            userId: +userId,
            userIp: userIp,
            reqMethod: reqMethod,
            resStatus: +resStatus,
            resDuration: +resDuration,
            reqOriginalUrl: reqOriginalUrl,
            userAgent: userAgent,
          },
        };
      } else {
        // 2. 시스템 로그인 경우
        console.log(e.timestamp);
        return {
          context: e.context,
          level: e.level,
          message: e.message,
          timestamp: e.timestamp,
          data: {},
        };
      }
    });

    // 3. DB에 모두 저장
    await Promise.all(
      data.map(async (c) => {
        await this.logRepository.save({
          context: c.context,
          level: c.level,
          message: c.message,
          timestamp: c.timestamp,
          reqMethod: c.data.reqMethod,
          reqOriginalUrl: c.data.reqOriginalUrl,
          resDuration: c.data.resDuration,
          resStatus: c.data.resStatus,
          userId: c.data.userId,
          userIp: c.data.userIp,
          userAgent: c.data.userAgent,
        });
      })
    );

    // 4. 전송이 끝난 로그파일은 삭제
    return;
  }
}
