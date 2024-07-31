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

        // 알림 표시
        alert(result.message);

        // 메인 페이지로 이동
        window.location.href = './main.html';
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
