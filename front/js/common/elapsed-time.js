/** 시간 표시 함수 **/
export const elapsedTime = (date) => {
  // 1. 한국시간으로 보정 (9시간) = 서버 시간 변경되어서 9시간 보정 안해도 됨(삭제처리완료)
  const korDate = Number(new Date(date));
  // 2. start(알람생성시각), end(현재시각)
  const start = new Date(korDate);
  const end = new Date();
  // 3. [현재시각 - 알람생성시각] 차 계산해서 그 격차값이
  // 3-1. 60초 미만이라면 => '방금 전'
  const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
  if (seconds < 60) return '방금 전';
  // 3-2. 60분 미만이라면 => 'N분 전'
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}분 전`;
  // 3-3. 24시간 미만이라면 => 'N시간 전'
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}시간 전`;
  // 3-4. 7일 미만이라면 => 'N일 전'
  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}일 전`;
  // 3-5. 7일 이상이라면 => '그냥 날짜 표기'
  const time = start.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return time;
};
