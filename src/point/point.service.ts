import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Point } from './entities/point.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { PointLog } from './entities/point-log.entity';
import { User } from 'src/user/entities/user.entity';
import { MaxPointScore, PointScore, PointType } from './types/point.type';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>,
  ) {}

  // 출석 체크 메소드
  async checkAttendance(userId: number): Promise<void> {
    // 1. 유효한 사용자인지 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유효한 사용자를 찾을 수 없습니다.');
    }

    // 2. 오늘 출석을 했는지 확인
    const todayPoint = await this.findTodayPointById(
      userId,
      PointType.ATTENTION
    );
    const maxPoint = MaxPointScore[PointType.ATTENTION];

    if (todayPoint >= maxPoint) {
      throw new ForbiddenException('오늘 이미 출석을 하였습니다.');
    }

    // 3. ATTENTION으로 포인트 로그 테이블에 추가 및 포인트 테이블에 +출석 포인트
    await this.savePointLog(userId, PointType.ATTENTION, true);
  }

  // 포인트 조회 메소드
  async getPointSummary(userId: number): Promise<any> {
    // 1. 유효한 사용자인지 체크
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유효한 사용자를 찾을 수 없습니다.');
    }

    // 2. 누적 포인트 조회
    const point = await this.pointRepository.findOne({ where: { userId } });
    const totalPoint = point ? point.accPoint : 0; // 누적 포인트

    // 3. 오늘 포인트 타입별 획득 포인트 조회
    const todayPoints = {
      attention: await this.findTodayPointById(userId, PointType.ATTENTION),
      weeklyAttention: await this.findTodayPointById(
        userId,
        PointType.WEEKLY_ATTENTION
      ),
      post: await this.findTodayPointById(userId, PointType.POST),
      comment: await this.findTodayPointById(userId, PointType.COMMENT),
      postLike: await this.findTodayPointById(userId, PointType.POST_LIKE),
      commentLike: await this.findTodayPointById(
        userId,
        PointType.COMMENT_LIKE
      ),
    };

    // 3-1. 오늘 포인트 타입별 획득 포인트 횟수 = 획득 점수 / 기본 점수
    const todayCounts = {
      attention: todayPoints.attention / PointScore.ATTENTION,
      post: todayPoints.post / PointScore.POST,
      postLike: todayPoints.postLike / PointScore.POST_LIKE,
      comment: todayPoints.comment / PointScore.COMMENT,
      commentLike: todayPoints.commentLike / PointScore.COMMENT_LIKE,
    };

    // 4. 최대 횟수 계산 = 최대 점수 / 기본 점수
    const maxCounts = {
      attention: MaxPointScore.ATTENTION / PointScore.ATTENTION,
      weeklyAttention:
        MaxPointScore.WEEKLY_ATTENTION / PointScore.WEEKLY_ATTENTION,
      post: MaxPointScore.POST / PointScore.POST,
      comment: MaxPointScore.COMMENT / PointScore.COMMENT,
      postLike: MaxPointScore.POST_LIKE / PointScore.POST_LIKE,
      commentLike: MaxPointScore.COMMENT_LIKE / PointScore.COMMENT_LIKE,
    };

    // 5. 결과 반환 : todayPoints 삭제.
    return {
      id: userId,
      nickname: user.nickname, // 닉네임 추가
      totalPoint,
      counts: todayCounts,
      maxCounts,
    };
  }

  // 포인트 추가, 차감 메소드
  async savePointLog(
    userId: number,
    pointType: PointType,
    sign: boolean,
  ) {
    const point = await this.pointRepository.findOne({ where: { userId } });

    const pointScore = PointScore[pointType];
    const newPoint = sign
      ? point.accPoint + pointScore
      : point.accPoint - pointScore;

    // 포인트 테이블 업데이트
    await this.pointRepository.update({ userId }, { accPoint: newPoint });

    // sign = true 면 포인트 추가, sign = false 면 포인트 차감
    // 포인트 로그 테이블에 추가
    await this.pointLogRepository.save({
      userId,
      pointType,
      point: sign ? pointScore : -pointScore,
    });
  }

  // 포인트 유효성 검사 메소드
  async validatePointLog(
    userId: number,
    pointType: PointType
  ): Promise<boolean> {
    // findTodayPointById로 나온 숫자가 기준을 넘으면 false
    // 기준을 안 넘으면 true
    const todayPoint = await this.findTodayPointById(userId, pointType);
    const maxPoint = MaxPointScore[pointType];

    return todayPoint < maxPoint;
  }

  // 오늘 포인트 타입 몇점인지 검색하는 메소드
  async findTodayPointById(
    userId: number,
    pointType: PointType
  ): Promise<number> {
    // 오늘 날짜 기준으로 입력받은 pointType의 점수를 합하여 number형태로 return
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const pointLogs = await this.pointLogRepository.find({
      where: {
        userId,
        pointType,
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    return pointLogs.reduce((acc, log) => acc + log.point, 0);
  }

  //누적 포인트 랭킹 조회
  async pointRank(num: number) {
    const pointRank = await this.pointRepository.query(
      `
      select a.acc_point , b.nickname
      from points a join users b
      on a.user_id = b.id
      order by acc_point DESC
      limit ${num};
      `
    );
 
    return pointRank;
  }

  //주간 포인트 랭킹 조회 (매주 일요일~토요일))
  async pointWeeklyRank(num: number) {
    const pointRank = await this.pointLogRepository.query(
      `
      select c.id AS userId, c.nickname, c.point, d.acc_point AS accPoint
      from (SELECT b.id as id, b.nickname as nickname, SUM(a.point) AS point
      FROM point_logs a
      JOIN users b ON a.user_id = b.id
      WHERE a.created_at >=  DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 8) DAY)
      AND a.created_at < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 1) DAY)
      GROUP BY b.nickname
      ORDER BY point DESC) c left join points d
      on c.id = d.user_id
      limit ${num};
      `
    );

    return pointRank
  }

  // 오늘 포인트 타입 횟수 검색하는 메소드
  async findTodayPointCountById(
    userId: number,
    pointType: PointType
  ): Promise<number> {
    // 오늘 날짜 기준으로 입력받은 pointType의 횟수를 return
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // 조건에 맞는 레코드의 개수를 계산
    const count = await this.pointLogRepository.count({
      where: {
        userId,
        pointType,
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    return count;
  }
}
