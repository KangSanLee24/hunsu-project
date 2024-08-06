import { API_BASE_URL } from '../../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');
  const userNickname = document.getElementById('userNickname'); // 사용자 닉네임

  if (accessToken) {
    fetchUserInfo(accessToken, refreshToken);
  } else {
    showLoginOptions();
  }

  /** 로그인 회원가입 버튼 보이고, 닉네임 숨기기 */
  function showLoginOptions() {
    if (loginLink) loginLink.style.display = 'block';
    if (signUpLink) signUpLink.style.display = 'block';
    userNickname.style.display = 'none';
  }

  /** 로그인 회원가입 버튼 숨기고, 닉네임을 표시 */
  function displayUserInfo(nickname) {
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';

    userNickname.innerHTML = `${nickname}님`;
    userNickname.style.display = 'block';
  }

  /** accessToken으로 내 정보 조회 API */
  async function fetchAccessToken(accessToken) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  }

  /** refreshToken으로 accessToken 재발급 API */
  async function fetchRefreshToken(refreshToken) {
    const response = await fetch(`${API_BASE_URL}/auth/re-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    return await response.json();
  }

  async function fetchUserInfo(accessToken, refreshToken) {
    try {
      const result = await fetchAccessToken(accessToken);

      if (result.status === 200) {
        // accessToken이 유효한 경우
        displayUserInfo(result.data.nickname);
      } else if (refreshToken) {
        console.log('🚀 ~ 리프레시 토큰 재발급 시작!');
        // accessToken이 유효하지 않을 때
        const refreshResult = await fetchRefreshToken(refreshToken);

        if (refreshResult.status === 200) {
          // accessToken 재발급 성공
          const newAccessToken = refreshResult.data; // 새로 받은 accessToken
          localStorage.setItem('accessToken', newAccessToken); // 새 accessToken 저장

          // 새 accessToken으로 내 정보 조회
          const newResult = await fetchAccessToken(newAccessToken);
          if (newResult.status === 200) {
            displayUserInfo(newResult.data.nickname);
          } else {
            // 재조회 실패시 로그인 옵션 표시
            showLoginOptions();
          }
        } else {
          // refreshToken으로도 실패한 경우
          showLoginOptions();
        }
      } else {
        // refreshToken이 없는 경우
        showLoginOptions();
      }
    } catch (error) {
      console.error(error);
      alert('사용자 정보를 불러오는 데 문제가 발생했습니다.');
      showLoginOptions();
    }
  }
});
