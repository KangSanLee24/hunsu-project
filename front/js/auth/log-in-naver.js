document.addEventListener('DOMContentLoaded', () => {
  // 1. 쿼리스트링 주소로 받아온 데이터 가져오기
  const urlParams = new URLSearchParams(location.search);
  const userId = urlParams.get('id');
  const certification = urlParams.get('certification');

  // 2. 네이버 로그인
  const naverLogIn = async (userId, certification) => {
    // 2-1. 오류검사 (id, certification 있는지)
    if (!userId) {
      return console.error('userId가 없습니다.');
    }
    if (!certification) {
      return console.error('certification이 없습니다.');
    }

    // 2-2. 쿼리파람스 생성
    const queryParams = new URLSearchParams({
      userId: userId,
      certification: certification,
    });

    // 2-3. id(userId)와 certification으로 ATK, RTK 받아오기
    const response = await fetch(
      `/api/auth/log-in/naver/rc?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. fetch 받아온 result를 json으로
    const result = await response.json();

    // 4. 로그인 관련 데이터 처리
    if (response.ok && result.status === 200) {
      // 4-A. 로그인 성공시
      // 4-A-1. 토큰들 로컬스토리지에 저장
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);

      // 4-A-2. '로그인에 성공했습니다.' alert
      checkAttendance(result.data.accessToken);
      alert(result.message);

      // 4-A-3. 메인 페이지로 이동
      window.location.href = localStorage.getItem('redirectUrl');
    } else {
      // 4-B. 기타 로그인 에러 처리
      alert(result.message || '네이버 로그인에 실패했습니다.');
    }
  };

  /** 실행 **/
  naverLogIn(userId, certification);

  // 출석 체크 함수
  async function checkAttendance(accessToken) {
    try {
      const response = await fetch(`/api/points/today`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      console.log('출석 체크 API 응답:', result);

      if (!response.ok) {
        throw new Error('출석 체크에 실패했습니다.');
      }

      return result;
    } catch (error) {
      console.error('Error during attendance check:', error);
      return { error: error.message };
    }
  }
});
