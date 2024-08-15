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
import { RedisService } from 'src/redis/redis.service';
import { SERVER_START_DATE } from 'src/constants/point-redis.constant';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>,

    private readonly redisService: RedisService
  ) {}

  // 출석 체크 메소드
  async checkAttendance(user: User): Promise<void> {
    // 0. 데이터 정리
    const userId = user.id;

    // 1. 유효한 사용자인지 체크
    const validUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!validUser) {
      throw new NotFoundException('유효한 사용자를 찾을 수 없습니다.');
    }

    // 2. 오늘 출석을 했는지 체크
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
  async savePointLog(userId: number, pointType: PointType, sign: boolean) {
    const point = await this.pointRepository.findOne({ where: { userId } });
    const user = await this.userRepository.findOneBy({ id: userId });

    const pointScore = PointScore[pointType];
    const newPoint = sign
      ? point.accPoint + pointScore
      : point.accPoint - pointScore;

    // 포인트 테이블 업데이트
    await this.pointRepository.update({ userId }, { accPoint: newPoint });

    // sign = true 면 포인트 추가, sign = false 면 포인트 차감
    // 포인트 로그 테이블에 추가
    const pointResult = await this.pointLogRepository.save({
      userId,
      pointType,
      point: sign ? pointScore : -pointScore,
    });

    // 4. 레디스 포인트 증감
    await this.setPointLog(user, pointResult.point);
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

  //누적 포인트 조회 (전체)
  async totalPoint(): Promise<any[]> {
    const totalPoint = await this.pointRepository.query(
      `
      select a.acc_point AS point , b.nickname
      from points a join users b
      on a.user_id = b.id
      `
    );
    return totalPoint;
  }

  //누적 포인트 랭킹 조회 (TOP N명)
  async pointRank(num: number): Promise<any[]> {
    const pointRank = await this.pointRepository.query(
      `
      select a.acc_point AS point , b.nickname
      from points a join users b
      on a.user_id = b.id
      order by acc_point DESC
      limit ${num};
      `
    );
    return pointRank;
  }

  //주간 포인트 랭킹 조회 (지난주 : 일요일 ~ 토요일)
  async pointWeeklyRank(num: number): Promise<any[]> {
    const pointRank = await this.pointLogRepository.query(
      `
      SELECT b.id, b.nickname, SUM(a.point) AS point
      FROM point_logs a
      JOIN users b ON a.user_id = b.id
      WHERE a.created_at >=  DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 8) DAY)  
        AND a.created_at < DATE_SUB(CURDATE(), INTERVAL (WEEKDAY(CURDATE()) + 1) DAY)
      GROUP BY b.nickname 
      ORDER BY point DESC
      limit ${num};
      `
    );
    return pointRank;
  }

  //주간 포인트 로그 합산 조회 (이번주 : 일요일 ~ 오늘)
  async thisWeekPointLogs(): Promise<any[]> {
    const thisWeek = await this.pointLogRepository.query(
      `
      SELECT b.id, b.nickname, SUM(a.point) AS point
      FROM point_logs a
      JOIN users b ON a.user_id = b.id
      WHERE a.created_at >=  DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)  
        AND a.created_at < DATE_SUB(CURDATE(), INTERVAL -(6 - WEEKDAY(CURDATE())) DAY)
      GROUP BY b.nickname 
      `
    );
    return thisWeek;
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

  /** Point 증감 행동시 Redis에도 저장 **/
  async setPointLog(user: User, point: number) {
    // 1. Redis Update 여부 확인
    await this.updatePointRedisExecute();
    // 2. Redis 저장 SortedSET : This Week Point
    await this.sumThisWeekPoint(point, user.nickname);
    // 3. Redis 저장 SortedSET : Total Point
    await this.sumTotalPoint(point, user.nickname);
  }

  /** This Week Point Rank 누적 (= 이번주 [point_logs] 합산)  **/
  async sumThisWeekPoint(point: number, nickname: string) {
    // 1. Redis Key 생성
    const thisWeekNum = this.thisWeekNumber();
    const thisWeekKey = this.weekKey(thisWeekNum);
    // 2. Point 추가해주기
    await this.redisService.zincrbyValue(thisWeekKey, point, nickname);
  }

  /** Total Point Rank 누적 **/
  async sumTotalPoint(point: number, nickname: string) {
    // 1. Redis Key 생성
    const totalPointKey = 'point:total';
    // 2. Point 추가해주기
    await this.redisService.zincrbyValue(totalPointKey, point, nickname);
  }

  /** Last-week Point Rank 조회 **/
  async getLastWeekPointRank() {
    // 1. Redis Key 생성
    const lastWeekNum = this.lastWeekNumber();
    const lastWeekKey = this.weekKey(lastWeekNum);
    // 2. Redis Key로 조회
    const lastWeekPointRank = await this.redisService.zgetRank(lastWeekKey, 10);
    // 3. Redis 데이터가 존재하는가?
    if (!lastWeekPointRank || lastWeekPointRank.length == 0) {
      // 3-1. 없으면 기존 API 실행 (TOP 10)
      const data = await this.pointWeeklyRank(10);
      // 3-2. Redis 데이터 생성
      const dataArray = await this.makeLastWeekPointRankRedisData(data);
      // 3-3. 데이터 반환
      return dataArray;
    }
    // 4. Redis 데이터가 있으면 Redis 데이터 반환
    return lastWeekPointRank;
  }

  /** Total Point Rank 조회 **/
  async getTotalPointRank() {
    // 1. Redis Key 생성
    const totalPointKey = 'point:total';
    // 2. Redis Key로 조회
    const totalPointRank = await this.redisService.zgetRank(totalPointKey, 10);
    // 3. Redis 데이터가 존재하는가?
    if (!totalPointRank || totalPointRank.length == 0) {
      // 3-1. 없으면 기존 API 실행 (TOP 10)
      const data = await this.pointRank(10);
      // 3-2. Redis 데이터 생성
      const dataArray = await this.makeTotalPointRankRedisData(data);
      // 3-3. 데이터 반환
      return dataArray;
    }
    // 4. Redis 데이터가 있으면 Redis 데이터 반환
    return totalPointRank;
  }

  /** Weekly Point TOP10 Redis 데이터가 없는 경우 생성 **/
  async makeLastWeekPointRankRedisData(data: any[]) {
    // 1. Redis Key 생성
    const lastWeekNum = this.lastWeekNumber();
    const lastWeekKey = this.weekKey(lastWeekNum);
    // 2. Redis 데이터 생성
    const dataArray = await this.redisService.zaddValue(
      lastWeekKey,
      data,
      true
    );
    // 3. Redis 데이터 반환
    return dataArray;
  }

  /** Total Point TOP10 Redis 데이터가 없는 경우 생성 **/
  async makeTotalPointRankRedisData(data: any[]) {
    // 1. Redis Key 생성
    const totalPointKey = 'point:total';
    // 2. Redis 데이터 생성
    const dataArray = await this.redisService.zaddValue(
      totalPointKey,
      data,
      true
    );
    // 3. Redis 데이터 반환
    return dataArray;
  }

  /** 데이터 최신화(복원) 분기 **/
  async updatePointRedisExecute() {
    // A. This Week Point
    // A-1. Redis Key 생성
    const weeklyKey = 'update:point';
    // A-2. Redis에서 Redis Key로 데이터 확인
    const weeklyData = await this.redisService.getValue(weeklyKey);
    // A-3. 데이터 최신화(복원) 실행 결정 - weekly
    if (!weeklyData || weeklyData !== 'done') {
      // A-3-1. This Week Point ALL Redis 데이터 최신화(복원) 실행
      await this.updateThisWeekPointRedisDate();
      // A-3-2. 최신화(복원) 확인증 생성 (1일에 1회만 실행되도록)
      const ttlWeekly = 60 * 60 * 24;
      await this.redisService.setValue(weeklyKey, 'done', ttlWeekly);
    }

    // B. Total Point
    // B-1. Redis Key 생성
    const totalKey = 'update:total';
    // B-2. Redis에서 Redis Key로 데이터 확인
    const totalData = await this.redisService.getValue(totalKey);
    // B-3. 데이터 최신화(복원) 실행 결정 - total
    if (!totalData || totalData !== 'done') {
      // B-3-1. This Week Point ALL Redis 데이터 최신화(복원) 실행
      await this.updateTotalPointRedisData();
      // B-3-2. 최신화(복원) 확인증 생성 (7일에 1회만 실행되도록)
      const ttlTotal = 60 * 60 * 24 * 7;
      await this.redisService.setValue(totalKey, 'done', ttlTotal);
    }
  }

  /** This Week Point ALL Redis 데이터 최신화(복원) **/
  async updateThisWeekPointRedisDate() {
    // 1. DB에서 [point_logs] 테이블에서 기준요일~오늘까지 합산
    const data = await this.thisWeekPointLogs();
    // 2. Redis Key 생성
    const thisWeekNum = this.thisWeekNumber();
    const thisWeekKey = this.weekKey(thisWeekNum);
    // 3. Redis 데이터 생성(복원)
    const dataArray = await this.redisService.zaddValue(
      thisWeekKey,
      data,
      false
    );
  }

  /** Total Point ALL Redis 데이터 최신화(복원) **/
  async updateTotalPointRedisData() {
    // 1. DB에서 [points] 테이블 가져오기
    const data = await this.totalPoint();
    // 2. Redis Key 생성
    const totalPointKey = 'point:total';
    // 3. Redis 데이터 생성(복원)
    if (data) {
      const dataArray = await this.redisService.zaddValue(
        totalPointKey,
        data,
        false
      );
    }
  }

  // (+) N주차 구하기 (이번주)
  private thisWeekNumber() {
    // 1. 서버 시작일로부터 오늘은 며칠째인가?
    const today = new Date();
    const startDay = new Date(SERVER_START_DATE);
    const dayNumber =
      Math.floor(
        (today.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1;
    // 2. this week는 N주차
    const thisWeekNumber = Math.floor((dayNumber - 1) / 7) + 1;
    // 3. N 반환
    return thisWeekNumber;
  }

  // (+) N주차 구하기 (지난주)
  private lastWeekNumber(): number {
    // 1. 서버 시작일로부터 오늘은 며칠째인가?
    const today = new Date();
    const startDay = new Date(SERVER_START_DATE);
    const dayNumber =
      Math.floor(
        (today.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)
      ) + 1;
    // 2. last week는 N주차
    const lastWeekNumber = Math.floor((dayNumber - 1) / 7);
    // 3. N 반환
    return lastWeekNumber;
  }

  // (+) N주차 Point RedisKey 생성기
  private weekKey(weekNumber: number): string {
    // 1. Redis Key 생성
    const weekKey = `point:week:${weekNumber}`;
    // 2. Redis Key 반환
    return weekKey;
  }
}
