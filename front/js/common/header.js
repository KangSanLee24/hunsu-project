import { API_BASE_URL } from '../../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');
  const userNickname = document.getElementById('userNickname'); // 사용자 닉네임
  const headerNav = document.querySelector('header nav ul'); // header 요소 선언

  if (accessToken) {
    fetchUserInfo(accessToken, refreshToken);
  } else {
    showLoginOptions();
  }

  /** 로그인 회원가입 버튼 보이고, 닉네임 숨기기 */
  function showLoginOptions() {
    if (loginLink) loginLink.style.display = 'inline-block';
    if (signUpLink) signUpLink.style.display = 'inline-block';
    userNickname.style.display = 'none';

    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.remove();
    }
  }

  /** 로그인 회원가입 버튼 숨기고, 닉네임과 로그아웃 버튼을 표시 */
  function displayUserInfo(nickname) {
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';

    userNickname.innerHTML = `${nickname}님`;
    userNickname.style.display = 'inline-block';

    // 기존 로그아웃 버튼이 있으면 제거
    let logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.remove();
    }

    // 로그아웃 버튼 생성
    logoutLink = createElement('a', null, '로그아웃');
    logoutLink.id = 'logoutLink';
    logoutLink.href = '#';
    logoutLink.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      alert('로그아웃 되었습니다.');
      showLoginOptions();
      window.location.href = './main.html'; // 로그아웃 후 main.html로 이동
    });

    // 닉네임과 로그아웃 버튼을 나란히 배치
    const userInfoContainer = createElement('li', 'user-info', '');
    userInfoContainer.appendChild(userNickname);
    userInfoContainer.appendChild(logoutLink);
    headerNav.appendChild(userInfoContainer);
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

  // DOM 요소를 생성하는 함수
  function createElement(tag, className, innerHTML) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  // 공통 로그인 확인 함수
  function handleLoginRequired(event, redirectUrl) {
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
        // 현재 페이지 URL을 localStorage에 저장
        localStorage.setItem('redirectUrl', redirectUrl);
        // 로그인 페이지로 리다이렉트하면서 리다이렉트 URL을 전달
        window.location.href = './log-in.html';
      } else {
        // 로그인을 취소했을 때 포커스를 잃게 함
        event.target.blur();
      }
    }
  }

  // 버튼 종류 배열
  // 해당 버튼 클릭 후 지정한 위치로 가야할 때
  // localstorage 저장 식
  const buttons = [
    'myPageButton',
    'write-post',
    'alarmButton',
    'submit-comment',
  ];

  // 버튼별 리디렉션 URL
  const redirects = {
    // 지정 페이지 (토큰 있어야지만 접속 가능한 페이지)
    myPageButton: './my-page.html',
    'write-post': './post-create.html',
    alarmButton: './alarm.html',

    // 이전페이지 (단순히 이전페이지로 돌아갈때)
    'submit-comment': window.location.href,
  };

  // 버튼 클릭 이벤트 리스너
  buttons.forEach((buttonId) => {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener('click', (event) =>
        handleLoginRequired(event, redirects[buttonId])
      );
    }
  });

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
        handleLoginRequired(event, './chat-list.html');
      } else {
        // 로그인 되어 있으면 chat-create.js의 setupChatRoomFormToggle() 함수에 의해 모달 창이 열림
      }
    });
  }

  // 대댓글 버튼 클릭 이벤트 리스너 추가
  const commentList = document.getElementById('comment-list');
  if (commentList) {
    commentList.addEventListener('click', (event) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        handleLoginRequired(event, window.location.href);
      } else {
        if (event.target.classList.contains('submit-recomment')) {
          const recommentInput = event.target.nextElementSibling;
          recommentInput.style.display =
            recommentInput.style.display === 'none' ? 'block' : 'none';
        }
      }
    });
  }
});
