import { levelMark } from './level-rank.js';
import { fetchAccessToken, fetchRefreshToken } from './identify-user.js';
import { alarmSSE } from './alarm.js'


export async function fetchUserInfo(accessToken, refreshToken) {
    try {
      const result = await fetchAccessToken(accessToken);

      if (result.status === 200) {
        // accessToken이 유효한 경우
        displayUserInfo(
          result.data.id,
          result.data.point,
          result.data.nickname
        );
        if (result.data.role == 'ADMIN') adminBtn.style.display = 'block';
      } else if (refreshToken) {
        // accessToken이 유효하지 않을 때
        const refreshResult = await fetchRefreshToken(refreshToken);

        if (refreshResult.status === 200) {
          // accessToken 재발급 성공
          const newAccessToken = refreshResult.data; // 새로 받은 accessToken
          localStorage.setItem('accessToken', newAccessToken); // 새 accessToken 저장

          // 새 accessToken으로 내 정보 조회
          const newResult = await fetchAccessToken(newAccessToken);
          if (newResult.status === 200) {
            displayUserInfo(
              newResult.data.id,
              newResult.data.point,
              newResult.data.nickname
            );
            if (newResult.data.role == 'ADMIN')
              adminBtn.style.display = 'block';
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

/** 로그인 O상태 - 로그인 회원가입 버튼 숨기고, 닉네임과 로그아웃 버튼을 표시 */
export function displayUserInfo(id, point, nickname) {
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';
  
    // 알람 연결
    const userId = id;
    alarmSSE(userId);
  
    // 닉네임 표기부분
    userNickname.innerHTML = `<span class="nickname">${levelMark(point)}${nickname}</span><span class="nim">님</span>`;
    userNickname.style.display = 'flex';
  
    // 기존 로그아웃 버튼이 있으면 제거
    let logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.remove();
    }
  
    // 로그아웃 버튼 생성
    logoutLink = createElement('a', null, `&nbsp;로그아웃`);
    logoutLink.id = 'logoutLink';
    logoutLink.className = 'logout-link';
    logoutLink.href = '#';
    logoutLink.addEventListener('click', async () => {
      // if (window.confirm('로그아웃 하시겠습니까?')) {
      await logout();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // alert('로그아웃 되었습니다.');
      showLoginOptions();
      window.location.href = localStorage.getItem('redirectUrl'); // 로그아웃 후 index로 이동
      // }
    });
  
    // 닉네임과 로그아웃 버튼을 나란히 배치
    const userInfoContainer = createElement('li', 'user-info', '');
    userInfoContainer.appendChild(userNickname);
    userInfoContainer.appendChild(logoutLink);
    headerNav.appendChild(userInfoContainer);
}
  

   /** 로그인 X상태 - 로그인 회원가입 버튼 보이고, 닉네임 숨기기 */
export function showLoginOptions() {
    if (loginLink) loginLink.style.display = 'inline-block';
    if (signUpLink) signUpLink.style.display = 'inline-block';
    userNickname.style.display = 'none';
  
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.remove();
    }
}