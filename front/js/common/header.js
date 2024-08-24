import { levelMark } from './level-rank.js';
import { rankMark } from './level-rank.js';
import { identifyUser } from './identify-user.js';

/** 헤더에 필요한 변수들 선언 **/
// 1. 로그인 관련 변수 선언
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
const loginLink = document.querySelector('a[href="./log-in"]');
const signUpLink = document.querySelector('a[href="./sign-up"]');
const userNickname = document.getElementById('userNickname'); // 사용자 닉네임

// 2. 현재 페이지 위치 URL을 localStorage에 저장
const redirectUrl = window.location.href;
const preUrl = localStorage.setItem('redirectUrl', redirectUrl);

// 3. 헤더 관련 변수 선언
const adminBtn = document.getElementById('admin-btn');
const headerNav = document.querySelector('header nav ul'); // header 요소 선언

// 4. 기타 변수 선언
const hashtagRank = document.getElementById('tab-hashtag-rank');

/** 페이지 로드되면 바로 실행 **/
document.addEventListener('DOMContentLoaded', () => {
  if (accessToken) {
    fetchUserInfo(accessToken, refreshToken);
  } else {
    showLoginOptions();
  }

  /** 로그인 X상태 - 로그인 회원가입 버튼 보이고, 닉네임 숨기기 */
  function showLoginOptions() {
    if (loginLink) loginLink.style.display = 'inline-block';
    if (signUpLink) signUpLink.style.display = 'inline-block';
    userNickname.style.display = 'none';

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.remove();
    }
  }

  /** 로그인 O상태 - 로그인 회원가입 버튼 숨기고, 닉네임과 로그아웃 버튼을 표시 */
  function displayUserInfo(id, point, nickname) {
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

  // 로그아웃 API 호출 함수
  async function logout() {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/auth/log-out`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  }

  /** accessToken으로 내 정보 조회 API */
  async function fetchAccessToken(accessToken) {
    const response = await fetch(`/api/users/me`, {
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
    const response = await fetch(`/api/auth/re-token`, {
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

  // DOM 요소를 생성하는 함수
  function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  // 댓글 작성 textarea 클릭 이벤트 리스너 추가
  const commentContentTextarea = document.getElementById('comment-content');
  if (commentContentTextarea) {
    commentContentTextarea.addEventListener('click', (event) => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        handleLoginRequired(event, window.location.href);
      }
    });
  }

  // 채팅방 만들기 버튼 별도로 처리
  // 로그인하면 모달창이 켜지면서 자꾸 리디렉션 페이지로 넘어가져서 따로 뺐음.
  const createChatButton = document.getElementById('createChatButton');
  if (createChatButton) {
    createChatButton.addEventListener('click', (event) => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        handleLoginRequired(event, './chat-list');
      } else {
        // 로그인 되어 있으면 chat-create.js의 setupChatRoomFormToggle() 함수에 의해 모달 창이 열림
      }
    });
  }

  const clickAlarmBtn = function () {
    // 로그인 상태인지 확인
    if (!accessToken) {
      // 로그인 상태가 아니라면
      if (window.confirm('로그인 하시겠습니까?')) {
        // 로그인 페이지로 이동
        window.location.href = './log-in';
      } else {
        // 비워둠
      }
    } else {
      // 로그인 상태라면
      window.location.href = './alarm';
    }
  };

  const clickMyPageBtn = function () {
    // 로그인 상태인지 확인
    if (!accessToken) {
      // 로그인 상태가 아니라면
      if (window.confirm('로그인 하시겠습니까?')) {
        // 로그인 페이지로 이동
        window.location.href = './log-in';
      } else {
        // 비워둠
      }
    } else {
      // 로그인 상태라면
      window.location.href = './my-page';
    }
  };

  const clickCreatePostBtn = function () {
    // 로그인 상태인지 확인
    if (!accessToken) {
      // 로그인 상태가 아니라면
      if (window.confirm('로그인 하시겠습니까?')) {
        // 로그인 페이지로 이동
        window.location.href = './log-in';
      } else {
        // 비워둠
      }
    } else {
      // 로그인 상태라면
      window.location.href = './post-create';
    }
  };

  /** 랜더링 - HASHTAG RANK **/
  function renderHashtagRank(data) {
    let hasharray = [];
    hashtagRank.innerHTML = '';
    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 0; i < data.length / 2; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `        
          <div class="hashtag-rank-info">                  
          <div class="hashtag-rank-ranking">
          <span class="hashtag-rank-ranking-var">${rankMark(i + 1)}</span>
          </div>                  
          <div class="hashtag-rank-hashtag">
          <span>${data[2 * i]}</span>
          </div>                  
          <div class="hashtag-rank-count">
          <span>${Number(data[2 * i + 1])}</span>
          </div>
          </div>
          `;
      // 1-2. HASHTAG RANK TAB에 데이터 넣어주기
      hashtagRank.appendChild(row);
    }
  }

  // 전역선언
  window.clickAlarmBtn = clickAlarmBtn;
  window.clickMyPageBtn = clickMyPageBtn;
  window.clickCreatePostBtn = clickCreatePostBtn;

  /** SSE 알람 **/
  function alarmSSE(userId) {
    const eventSource = new EventSource(`/api/alarms/sse/${userId}`);

    // 1. SSE - 메시지 받기
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type == 'alarm') {
        console.log(`알람: ${data.message}`);
        alert(`알람: ${data.message}`);
      } else if (data.type == 'hashtag') {
        // 현재 페이지가 메인페이지 인 경우에만
        const nowUrl = localStorage.getItem('redirectUrl');
        if (
          nowUrl == 'http://localhost:3000' ||
          nowUrl == 'http://localhost:3000/' ||
          nowUrl == 'http://localhost:3000/index' ||
          nowUrl == 'https://5zirap.shop' ||
          nowUrl == 'https://5zirap.shop/' ||
          nowUrl == 'https://5zirap.shop/index'
        ) {
          renderHashtagRank(data.data);
        }
      }
    };

    // 2. SSE - 알람 활성화 알림
    eventSource.onopen = () => {
      console.log('서버의 알람기능과 연결되었습니다.');
    };

    // 3. SSE - 알람 비활성화 알림
    eventSource.onclose = () => {
      console.log('서버의 알람기능을 종료했습니다.');
    };

    // 4. SSE - 알람 에러
    eventSource.onerror = (error) => {
      console.error(
        '서버와의 연결이 끊겨 일시적으로 알람이 중단되었습니다. 새로고침시 다시 연결됩니다.'
      );
    };

    // 페이지 이탈 시 SSE 연결 종료
    window.addEventListener('unload', (e) => {
      e.preventDefault();
      eventSource.close();
    });
  }
});

// 공통 로그인 확인 함수
export function handleLoginRequired(event, redirectUrl) {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    // 로그인 되어 있으면 지정된 URL로 이동
    window.location.href = redirectUrl;
  } else {
    // 로그인 되어 있지 않으면 알림창 표시
    event.preventDefault(); // 기본 동작 막기
    const confirmLogin = confirm(
      '로그인이 되어있지 않습니다. 로그인을 하시겠습니까?'
    );
    if (confirmLogin) {
      // 로그인 페이지로 리다이렉트하면서 리다이렉트 URL을 전달
      window.location.href = './log-in';
    } else {
      // 로그인을 취소했을 때 포커스를 잃게 함
      event.target.blur();
    }
  }
}

// export const handleLoginRequired = handleLoginRequired();
