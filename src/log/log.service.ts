import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>
  ) {}

  //   /** 로그 목록 조회(R-L) API **/
  //   async getAllLogs(page: number, limit: number) {
  //     const {items, meta} = await paginate<Log>(
  //         this.logRepository,
  //         {
  //             page,
  //             limit,
  //         },
  //         {
  //             where: {},
  //             or
  //         }
  //     )
  //   }

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
}
