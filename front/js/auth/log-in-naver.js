import { API_BASE_URL } from '../../config/config.js';

/** 화면이 로딩되면 자동으로 실행 **/
document.addEventListener('DOMContentLoaded', () => {
  /** 네이버 콜백 호출 함수 **/
  const naverLogIn = async () => {
    try {
      // 1. 네이버 로그인 콜백 API 호출
      const response = await fetch(`${API_BASE_URL}/auth/log-in/naver/cb`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // 2. 네이버 로그인 결과 json화
      const result = await response.json();
      // 3. 네이버 로그인
      if (response.ok && result.status === 200) {
        // 3-1. 성공시 토큰 저장
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
      } else {
        // 3-2. 실패시 '로그인 실패' 엘러트
        alert(result.message || '로그인에 실패했습니다.');
      }
      // 4. 결과 엘러트
      alert(result.message);
      // 5. 메인페이지로 이동
      window.location.href = './main.html';
    } catch (error) {
      // 6. 위 모든 상황에서 에러 발생시 메시지
      console.error('네이버에서 응답이 오지 않습니다.');
    }
  };

  /** 리다이렉트 받으면 네이버 콜백 호출 함수 실행 **/
  naverLogIn();
  console.log('네이버 로그인 시도');
});
