import { API_BASE_URL } from '../../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const response = await fetch(`${API_BASE_URL}/auth/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        // 토큰 저장
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);

        // 출석 체크 API 호출
        const attendanceResult = await checkAttendance(result.data.accessToken);
        console.log('출석 체크 호출 결과:', attendanceResult);

        // 알림 표시
        alert(result.message);

        // // 메인 페이지로 이동
        // window.location.href = './main.html';
        // 리다이렉트 URL 확인
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect') || './main.html';

        // 리다이렉트 URL로 이동
        window.location.href = redirectUrl;
      } else if (
        result.message ===
        '아직 이메일 인증을 하지 않으셨습니다. 이메일 인증을 진행해 주세요.'
      ) {
        // 이메일 인증이 필요한 경우
        alert(result.message);
        window.location.href = './email-confirmation.html';
      } else {
        // 에러 처리
        alert(result.message || '로그인에 실패했습니다.');
      }
    });
  } else {
    console.error('로그인 폼을 찾을 수 없습니다.');
  }
});

// 출석 체크 함수
async function checkAttendance(accessToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/user/me/point`, {
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