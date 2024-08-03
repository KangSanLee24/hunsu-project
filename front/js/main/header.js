import { API_BASE_URL } from '../../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('accessToken');
  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');
  const userNickname = document.getElementById('userNickname'); // 사용자 닉네임

  if (accessToken) {
    fetchUserInfo(accessToken);
  } else {
    showLoginOptions();
  }

  function showLoginOptions() {
    if (loginLink) loginLink.style.display = 'block';
    if (signUpLink) signUpLink.style.display = 'block';
    userNickname.style.display = 'none';
  }

  async function fetchUserInfo(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (result.status === 200) {
        displayUserInfo(result.data.nickname);
      } else {
        showLoginOptions();
      }
    } catch (error) {
      console.error(error);
      alert('사용자 정보를 불러오는 데 문제가 발생했습니다.');
      showLoginOptions();
    }
  }

  function displayUserInfo(nickname) {
    // 로그인 버튼과 회원가입 버튼 숨기고, 닉네임을 표시
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';

    userNickname.innerHTML = `${nickname}님`; // 닉네임을 표시
    userNickname.style.display = 'block'; // 사용자 이름이 보이도록 설정
  }
});
