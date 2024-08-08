import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  MessageEvent,
} from '@nestjs/common';

import { Alarm } from './entities/alarm.entity';
import { User } from 'src/user/entities/user.entity';
import { Post } from 'src/post/entities/post.entity';
import { Comment } from 'src/comment/entities/comment.entity';

import { AlarmFromType } from './types/alarm-from.type';
import { ALARM_MESSAGES } from 'src/constants/alarm-message.constant';
import { ConfigService } from '@nestjs/config';
import { Observable, Subject, filter, map } from 'rxjs';
import { paginate } from 'nestjs-typeorm-paginate';

@Injectable()
export class AlarmService {
  // 신규 생성 이벤트 [알람 받을 유저 명단]
  private users$: Subject<any> = new Subject();

  // 신규 생성 이벤트 [감지기]
  private observer = this.users$.asObservable();

  constructor(
    private readonly configService: ConfigService,

    @InjectRepository(Alarm)
    private readonly alarmRepository: Repository<Alarm>,

    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {}

  /** 1. 알람 생성(C) **/
  async createAlarm(
    userId: number, // 알람 소유주가 될 사용자ID
    fromType: AlarmFromType,
    fromNumber: number
  ) {
    // 0. 데이터 정리
    let notification = '';

    // 1. notification 생성
    if (fromType == AlarmFromType.POST) {
      notification = ALARM_MESSAGES.CREATE.MESSAGE_POST;
    } else if (fromType == AlarmFromType.COMMENT) {
      notification = ALARM_MESSAGES.CREATE.MESSAGE_COMMENT;
    } else if (fromType == AlarmFromType.LIVECHAT) {
      notification = ALARM_MESSAGES.CREATE.MESSAGE_LIVECHAT;
    }
    // 1-1. notification이 빈값인 경우
    if (notification == '') {
      throw new InternalServerErrorException(ALARM_MESSAGES.CREATE.FAILURE);
    }

    // 2. 알람 테이블에 데이터 생성
    const alarm = await this.alarmRepository.save({
      userId,
      fromType,
      fromNumber,
      notification,
    });

    // 3. 신규 생성 이벤트 등록
    this.newEventRegister(userId, notification);

    // 3. 반환
    return alarm;
  }

  /** 2. 알람 목록 조회(R-L) **/
  async findAllAlarm(user: User, page: number, limit: number) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 페이지네이션을 적용한 알람 조회
    const { items, meta } = await paginate<Alarm>(
      this.alarmRepository,
      {
        page,
        limit,
      },
      {
        where: { userId },
        order: { createdAt: 'DESC' },
      }
    );

    // 2. 반환
    return {
      alarms: items.map((alarm) => ({
        id: alarm.id,
        userId: alarm.userId,
        fromType: alarm.fromType,
        fromNumber: alarm.fromNumber,
        notification: alarm.notification,
        isChecked: alarm.isChecked,
        createdAt: alarm.createdAt,
        updatedAt: alarm.updatedAt,
      })),
      meta,
    };
  }

  /** 3. 알람 클릭 (Link) **/
  async clickAlarm(user: User, alarmId: number) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 해당 알람의 상세 정보 가져오기
    const alarm: Alarm = await this.alarmRepository.findOneBy({
      id: alarmId,
      userId,
    });
    // 1-1. 알람이 없으면
    if (!alarm) {
      throw new NotFoundException(ALARM_MESSAGES.CLICK.FAILURE.NO_ALARM);
    }

    // 2. 알람을 [읽음] 처리하고 (false인 경우에만 true로 변경)
    if (alarm.isChecked !== true) {
      await this.readAlarm(user, alarmId);
    }

    // 3. 유형에 맞게 데이터 제공
    // (프론트에서 링크이동할 것인지, 미리보기로 보여줄 것인지 판단할 것)
    // 3-1. POST
    if (alarm.fromType == AlarmFromType.POST) {
      // 3-1-1. 새 댓글이 달린 게시글 찾기
      const post = await this.postRepository.findOneBy({
        id: alarm.fromNumber,
      });
      // 3-1-2. 게시글id 반환
      return post.id;
    }
    // 3-2. COMMENT
    if (alarm.fromType == AlarmFromType.COMMENT) {
      // 3-2-1. 우선 대댓글이 달린 댓글을 찾고
      const comment = await this.commentRepository.findOneBy({
        id: alarm.fromNumber,
      });
      // 3-2-2. 해당 댓글이 달린 게시글을 찾아서
      const post = await this.postRepository.findOneBy({
        id: comment.postId,
      });
      // 3-2-3. 게시글id 반환
      return post.id;
    }
    // // 3-3. LIVECHAT
    // if (alarm.fromType == AlarmFromType.LIVECHAT) {
    // }
    // 3-4. 그 어느 것에도 해당하지 않는 경우
    throw new ForbiddenException('아직 개발 단계 입니다.');
  }

  /** 4. 알람 수정(U) **/
  /** 4-1. 알람 수정(U) - [읽음]처리 반전(개별 선택) **/
  async readAlarm(user: User, alarmId: number) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. [읽음]처리 반전할 알람 찾기
    const alarm = await this.alarmRepository.findOneBy({
      id: alarmId,
      userId,
    });
    // 1-1. 찾을 수 없는 경우
    if (!alarm) {
      throw new NotFoundException(ALARM_MESSAGES.UPDATE.FAILURE.NO_ALARM);
    }

    // 2. 해당 알람 [읽음]처리 반전
    if (alarm.isChecked !== true) {
      // 2-1. 해당 알람 [읽음]으로 처리 false => true
      await this.alarmRepository.update(
        {
          id: alarmId,
        },
        {
          isChecked: true,
        }
      );
    } else {
      // 2-2. 해당 알람 [읽음]처리 취소 true => false
      await this.alarmRepository.update(
        {
          id: alarmId,
        },
        {
          isChecked: false,
        }
      );
    }

    // 3. 데이터 가공
    const data = {
      alarmId: alarmId,
      isChecked: true,
    };

    // 4. 반환
    return data;
  }

  /** 4-2. 알람 수정(U) - [읽음]처리(남은 알람 전부) **/
  async readAllAlarm(user: User) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 아직 읽지 않은 알람들 모두 [읽음]처리
    const checked = await this.alarmRepository.update(
      {
        userId,
      },
      {
        isChecked: true,
      }
    );

    // 2. 결과 반환
    return {
      affectedAlarms: checked.affected,
    };
  }

  /** 5. 알람 수동 삭제(D) **/
  /** 5-1. 알람 수동 삭제(D) - 개별 선택 **/
  async deleteAlarm(user: User, alarmId: number) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 삭제할 알람 찾기
    const alarm = await this.alarmRepository.findOneBy({
      id: alarmId,
      userId,
    });
    // 1-1. 찾을 수 없는 경우
    if (!alarm) {
      throw new NotFoundException(ALARM_MESSAGES.DELETE.FAILURE.NO_ALARM);
    }

    // 2. 삭제하기
    await this.alarmRepository.delete({
      id: alarmId,
    });

    // 3. 데이터 가공
    const data = {
      alarmId: alarmId,
    };

    // 4. 반환
    return data;
  }

  /** 5-2. 알람 수동 삭제(D) - 읽음 처리된 것들 모두 **/
  async deleteAllCheckedAlarm(user: User) {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 읽은 알람들 모두 삭제 처리
    const deleted = await this.alarmRepository.delete({
      userId,
      isChecked: true,
    });

    // 2. 결과 반환
    return {
      deletedAlarms: deleted.affected,
    };
  }

  /** 6. 알람 자동 삭제(D) **/
  // 1. 읽음 처리 된 이후 일주일 뒤 자동 삭제
  // 2. 읽음 처리 여부와 상관 없이 한달이 지난 알람은 자동 삭제
  // 서비스 로직은 여기에 두고
  // API 호출은 schedule(모듈 생성)에서 cron <- 이거 써서 삭제

  /** 7. 신규 생성 이벤트 알람 (SSE) **/
  newEventAlarm(userId: number): Observable<any> {
    // 1. 이벤트 발생하면 [감지기] 작동
    return this.observer.pipe(
      // 2. 알람 소유주의 알람만 전송하도록
      filter((user) => {
        return user.id == userId;
      }),
      // 3. 알람 전송
      map((user) => {
        return {
          data: {
            message: user.data,
          },
        } as MessageEvent;
      })
    );
  }

  /** 신규 생성 이벤트 등록(SSE) (+) **/
  newEventRegister(userId: number, data: any) {
    // 알람 명단에 대상자 추가
    this.users$.next({ id: userId, data });
  }
}
