import { rankMark } from './level-rank.js';
import { clickAlarmBtn, clickMyPageBtn, clickCreatePostBtn } from './event-handlers.js';

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

// DOM 요소를 생성하는 함수
function createElement(tag, className, innerHTML) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (innerHTML) element.innerHTML = innerHTML;
  return element;
}

// /** 랜더링 - HASHTAG RANK **/
// export function renderHashtagRank(data) {
//   let hashArray = [];
//   hashtagRank.innerHTML = '';
//   // 1. 들어온 데이터를 하나하나 HTML화
//   for (let i = 0; i < data.length / 2; i++) {
//     // 1-1. 데이터로 row HTML 생성
//     const row = document.createElement('div');
//     row.innerHTML = `        
//         <div class="hashtag-rank-info">                  
//         <div class="hashtag-rank-ranking">
//         <span class="hashtag-rank-ranking-var">${rankMark(i + 1)}</span>
//         </div>                  
//         <div class="hashtag-rank-hashtag">
//         <span>${data[2 * i]}</span>
//         </div>                  
//         <div class="hashtag-rank-count">
//         <span>${Number(data[2 * i + 1])}</span>
//         </div>
//         </div>
//         `;
//     // 1-2. HASHTAG RANK TAB에 데이터 넣어주기
//     hashtagRank.appendChild(row);
//   }
// }

export function header() {
  if (accessToken) {
    fetchUserInfo(accessToken, refreshToken);
  } else {
    showLoginOptions();
  }

  /** 페이지 로드되면 바로 실행 **/
  document.addEventListener('DOMContentLoaded', () => {
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

  // 전역선언
  window.clickAlarmBtn = clickAlarmBtn;
  window.clickMyPageBtn = clickMyPageBtn;
  window.clickCreatePostBtn = clickCreatePostBtn;
});
}

