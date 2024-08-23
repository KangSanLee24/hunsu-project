import { rankMark, levelMark } from '../common/level-rank.js';

document.addEventListener('DOMContentLoaded', () => {
  /** 페이지에 필요한 변수 세팅 **/
  // 1. 로그인 관련 변수 선언
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;
  const loginLink = document.querySelector('a[href="./log-in"]');
  const signUpLink = document.querySelector('a[href="./sign-up"]');
  // 2. 인기채팅(HOT LIVECHAT) 관련 변수 선언
  const hotLiveChatList = document.getElementById('hot-live-chat-list');
  // 3. 화제글(HOT POST) 관련 변수 선언
  const hotPostListChat = document.getElementById('tab-chat');
  const hotPostListFashion = document.getElementById('tab-fashion');
  const hotPostListCooking = document.getElementById('tab-cooking');
  // 4. 포인트 랭킹(POINT RANK) 관련 변수 선언
  const weeklyPointRank = document.getElementById('tab-weekly-rank');
  const totalPointRank = document.getElementById('tab-total-rank');
  // 5. 해시태그 랭킹(HASHTAG RANK) 관련 변수 선언
  const hashtagRank = document.getElementById('tab-hashtag-rank');

  let hashRank = [];

  /** 로그인 상태에 따른 분기 세팅 **/
  // 1. 만약 로그인이 되어있다면
  if (isLoggedIn) {
    // 1-1. 로그인O => 로그인 및 회원가입 버튼 [숨기기]
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';
  } else {
    // 1-2. 로그인X
    // 1-2-1. => 로그인 및 회원가입 버튼 [보이기]
    if (loginLink) loginLink.style.display = 'block';
    if (signUpLink) signUpLink.style.display = 'block';
  }

  // fetchNaverShopping('뿔테안경');

  /** HOT LIVECHAT 랭킹 FETCH **/
  async function fetchHotLiveChats(num) {
    try {
      // 1. 쿼리스트링 구성
      const queryParams = new URLSearchParams({
        num: num,
      });

      // 2. fetch 받아오기 (HOT LIVECHAT)
      const response = await fetch(
        `/api/chatrooms/hotlivechat?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      // 3. fetch 받아온 result를 json으로
      const result = await response.json();

      // 4. 데이터 처리
      if (result.status === 200) {
        // 4-1. data가 배열인지 확인해서 맞으면
        if (Array.isArray(result.data)) {
          // 4-1-1. 렌더링 함수에 데이터 전달
          renderHotLivechatList(result.data);
        } else {
          // 4-1-2. data가 배열인지 확인해서 아니면
          console.error(
            'HOT LiveChat List 데이터 형식이 잘못되었습니다:',
            result.data
          );
        }
      } else {
        // 4-2. data를 애초에 조회하지 못한 경우 에러메시지
        console.error('HOT LiveChat List 조회 실패:', result.message);
      }
    } catch (error) {
      console.error('HOT LiveChat List 조회 API 호출 중 오류 발생:', error);
    }
  }

  /** FETCH - HOT POST TYPE(CHAT, FASHION, COOKING) **/
  async function fetchHotPosts(category) {
    try {
      // 1. 쿼리스트링 구성
      const queryParams = new URLSearchParams({
        category: category,
      });

      // 2. fetch 받아오기 (HOT POSTS [TYPE] LIST)
      const response = await fetch(`/api/posts/hot?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 3. fetch 받아온 result를 json으로
      const result = await response.json();

      // 4. 데이터 처리
      if (result.status === 200) {
        // 4-1. data가 배열인지 확인해서 맞으면
        if (Array.isArray(result.data)) {
          // 4-1-1. 렌더링 함수에 데이터 전달
          renderHotPostList(category, result.data);
        } else {
          // 4-1-2. data가 배열인지 확인해서 아니면
          console.error(
            'HOT 게시글 데이터 형식이 잘못되었습니다:',
            result.data
          );
        }
      } else {
        // 4-2. data를 애초에 조회하지 못한 경우 에러메시지
        console.error('HOT 게시글 목록 조회 실패:', result.message);
      }
    } catch (error) {
      // 5. 그 이외에 API 호출 도중 오류가 발생한 경우
      console.error('HOT 게시글 조회 API 호출 중 오류 발생:', error);
    }
  }

  /** FETCH - WEEKLY POINT RANK **/
  async function fetchWeeklyPointRank(num) {
    try {
      // 1. 쿼리스트링 구성
      const queryParams = new URLSearchParams({
        num: num,
      });

      // 2. fetch 받아오기 (WEEKLY POINT RANK - Redis)
      const weeklyResponse = await fetch(`/api/points/ranks-lastweek-redis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 3. fetch 받아온 result를 json으로
      const weeklyResult = await weeklyResponse.json();

      // 4. 데이터 처리
      if (weeklyResult.status === 200) {
        // 4-1. data가 배열인지 확인해서 맞으면
        if (Array.isArray(weeklyResult.data)) {
          // 4-1-1. 렌더링 함수에 데이터 전달
          renderWeeklyPointRank(weeklyResult.data);
        } else {
          // 4-1-2. data가 배열인지 확인해서 아니면
          console.error(
            '포인트 랭킹 데이터 형식이 잘못되었습니다:',
            weeklyResult.data
          );
        }
      } else {
        // 4-2. data를 애초에 조회하지 못한 경우 에러메시지
        console.error('포인트 랭킹 조회 실패:', weeklyResult.message);
      }
    } catch (error) {
      console.error('포인트 랭킹 조회 API 호출 중 오류 발생:', error);
    }
  }

  /** FETCH - TOTAL POINT RANK **/
  async function fetchTotalPointRank(num) {
    try {
      // 1. 쿼리스트링 구성
      const queryParams = new URLSearchParams({
        num: num,
      });

      // 2. fetch 받아오기 (TOTAL POINT RANK - Redis)
      const totalResponse = await fetch(`/api/points/ranks-total-redis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 3. fetch 받아온 result를 json으로
      const totalResult = await totalResponse.json();

      // 4. 데이터 처리
      if (totalResult.status === 200) {
        // 4-1. data가 배열인지 확인해서 맞으면
        if (Array.isArray(totalResult.data)) {
          // 4-1-1. 렌더링 함수에 데이터 전달
          renderTotalPointRank(totalResult.data);
        } else {
          // 4-1-2. data가 배열인지 확인해서 아니면
          console.error(
            '포인트 랭킹 데이터 형식이 잘못되었습니다:',
            totalResult.data
          );
        }
      } else {
        // 4-2. data를 애초에 조회하지 못한 경우 에러메시지
        console.error('포인트 랭킹 조회 실패:', totalResult.message);
      }
    } catch (error) {
      console.error('포인트 랭킹 조회 API 호출 중 오류 발생:', error);
    }
  }

  /** FETCH - HASHTAG RANK **/
  async function fetchHashtagRank() {
    try {
      // 1. 쿼리스트링 구성
      // 레디스로 이동 . 더이상 api에 쿼리스트링 없음

      // 2. fetch 받아오기 (HASHTAG RANK)
      const response = await fetch(`/api/hashtags/ranks-weekly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 3. fetch 받아온 result를 json으로
      const result = await response.json();

      // 4. 데이터 처리
      if (response.status === 200) {
        // 4-1. 렌더링 함수에 결과 전달
        renderHashtagRank(result);
      } else {
        // 4-2. data를 애초에 조회하지 못한 경우 에러메시지
        console.error('해시태그 랭킹 조회 실패:', result.message);
      }
    } catch (error) {
      console.error('해시태그 랭킹 조회 API 호출 중 오류 발생:', error);
    }
  }

  /** 랜더링 - HOT LIVECHAT**/
  function renderHotLivechatList(data) {
    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 0; i < data.length; i++) {
      // 1-0. 썸네일 있는지 확인 (없으면 기본 이미지를 썸네일로 적용)
      const thumbnail = data[i].imgUrl
        ? data[i].imgUrl
        : '/static/images/logo_long.png';
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `        
          <div class="hot-live-chat-card">            
            <div class="hot-live-chat-card-inner" onClick="clickLiveChat(${data[i].id})">
              <div class="card-thumbnail">
                <img
                  class="card-thumbnail-image"
                  src="${thumbnail}"
                />
              </div>              
              <div class="chat-info">                
                <div class="chat-title">
                  <span class="chat-title-var">💬${data[i].title}</span>
                </div>
                <!-- CHAT MAKER -->
                <div class="chat-maker">
                  <span class="chat-maker-var">${levelMark(data[i].point)}${data[i].nickname}</span>
                </div>
                <!-- CHAT HEADCOUNT -->
                <div class="chat-headcount">
                  <span class="chat-headcount-var">👨‍🏫${data[i].count}/100</span>
                </div>
              </div>
            </div>
          </div>
      `;
      // 1-2. HOT LIVECHAT TAB에 데이터 넣어주기
      hotLiveChatList.appendChild(row);
    }
  }

  /** 랜더링 - HOT POST **/
  function renderHotPostList(category, data) {
    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 0; i < data.length; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `
            <div class="post-info">
            <div class="post-title">
            <span class="post-title-var" onClick="clickPost(${data[i].id})">${data[i].title}</span>
            <span class="post-title-comment-var">(${data[i].numComments})</span>
            </div>
            <div class="post-writer">
            <span class="post-writer-var">🐣${data[i].nickname}</span>
              </div>
              <div class="post-date">
                <span class="post-date-var">${yyyymmdd(data[i].createdAt)}</span>
                </div>
                </div>       
                `;
      // 1-2. 카테고리에 맞게 데이터 넣어주기
      if (category == 'CHAT') {
        // 1-2-1. CHAT
        hotPostListChat.appendChild(row);
      } else if (category == 'FASHION') {
        // 1-2-2. FASHION
        hotPostListFashion.appendChild(row);
      } else if (category == 'COOKING') {
        // 1-2-3. COOKING
        hotPostListCooking.appendChild(row);
      } else {
        // 1-2-4. 그 외 (현재는 에러처리)
        console.error('화제글 카테고리 분류에서 에러가 발생했습니다.');
      }
    }
  }

  /** 랜더링 - WEEKLY POINT RANK **/
  function renderWeeklyPointRank(data) {
    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 0; i < data.length / 2; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `
                <div class="point-rank-info">
                <div class="point-rank-ranking">
                <span class="point-rank-ranking-var">${rankMark(i + 1)}</span>
                </div>                  
                <div class="point-rank-nickname">
                <span>${data[2 * i]}</span>
                </div>                  
                  <div class="point-rank-point">
                  <span>${Number(data[2 * i + 1])}</span>
                  </div>
                  </div>
                  `;
      // 1-2. WEEKLY POINT RANK TAB에 데이터 넣어주기
      weeklyPointRank.appendChild(row);
    }
  }

  /** 랜더링 - TOTAL POINT RANK **/
  function renderTotalPointRank(data) {
    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 0; i < data.length / 2; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `
      <div class="point-rank-info">
      <div class="point-rank-ranking">
      <span class="point-rank-ranking-var">${rankMark(i + 1)}</span>
      </div>                  
      <div class="point-rank-nickname">
      <span>${levelMark(Number(data[2 * i + 1]))}${data[2 * i]}</span>
      </div>                  
      <div class="point-rank-point">
      <span>${Number(data[2 * i + 1])}</span>
      </div>
      </div>
      `;
      // 1-2. TOTAL POINT RANK TAB에 데이터 넣어주기
      totalPointRank.appendChild(row);
    }
  }

  function renderHashtagRank(data) {
    hashtagRank.innerHTML = '';
    const hashRank = []; // 순위별 해시태그 리스트

    // 1. 들어온 데이터를 하나하나 HTML화
    for (let i = 1; i <= data.length; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `        
        <div class="hashtag-rank-info">
          <div class="hashtag-rank-ranking">
            <span class="hashtag-rank-ranking-var">${rankMark(i)}</span>
          </div>                  
          <div class="hashtag-rank-hashtag">
            <span>${data[i - 1].hashtag}</span>
          </div>                  
          <div class="hashtag-rank-count">
            <span>${Number(data[i - 1].count)}</span>
          </div>
        </div>
      `;
      // 1-2. HASHTAG RANK TAB에 데이터 넣어주기
      hashtagRank.appendChild(row);

      // 1 ~ 3위까지만 
      if (i <= 3) {
        const hashtagWithoutHash = data[i - 1].hashtag.replace('#', ''); // # 기호 제거
        hashRank.push({ hashtagWithoutHash, rank: i });
      }
    }

    // 데이터를 순차적으로 렌더링
    async function processShoppingData(hashRank) {
      for (let i = 0; i < hashRank.length; i++) {
        const { hashtagWithoutHash, rank } = hashRank[i];
        // 각 요청이 순차적으로 처리되어 순서가 보장됨
        await fetchNaverShopping(hashtagWithoutHash, rank);
      }
    }

    // 데이터를 렌더링
    processShoppingData(hashRank);
  }

  /** LIVECHAT 클릭 **/
  // 라이브챗을 클릭하면 해당 채팅방으로 이동
  async function clickLiveChat(roomId) {
    window.location.href = `/chat?roomId=${roomId}`;
  }

  /** HOT POST 클릭 **/
  // 게시글을 클릭하면 해당 게시글로 이동
  async function clickPost(postId) {
    window.location.href = `post-detail?id=${postId}`;
  }

  /** HOT POST TAB 관련 JS **/
  $(document).ready(function () {
    // 1. 게시판 탭 위에 마우스를 올리면(hover)
    $('ul.hot-post-rank-tabs li').hover(function () {
      var tabDataId = $(this).attr('data-tab');

      // 2. '현재' 지위를 잃은 이전 탭 리스트와 탭 콘텐츠박스
      // 2-1. 이전 탭 리스트 => current 클래스 박탈
      $('ul.hot-post-rank-tabs li').removeClass('current');
      // 2-2. 이전 탭 콘텐츠박스 => current 클래스 박탈
      $('.tab-contents-box').removeClass('current');

      // 3. '현재' 지위를 얻은 현재 탭 리스트와 탭 콘텐츠박스
      // 3-1. 현재 탭 리스트 => current 클래스 획득
      $(this).addClass('current');
      // 3-2. 현재 탭 콘텐츠박스 => current 클래스 획득
      $('#' + tabDataId).addClass('current');
    });
  });

  /** POINT RANK TAB 관련 JS **/
  $(document).ready(function () {
    // 1. 포인트 랭킹 탭 위에 마우스를 올리면(hover)
    $('ul.point-rank-tabs li').hover(function () {
      var tabDataId = $(this).attr('data-tab');

      // 2. '현재' 지위를 잃은 이전 탭 리스트와 탭 랭킹박스
      // 2-1. 이전 탭 리스트 => current 클래스 박탈
      $('ul.point-rank-tabs li').removeClass('current');
      // 2-2. 이전 탭 랭킹박스 => current 클래스 박탈
      $('.tab-ranking-box').removeClass('current');

      // 3. '현재' 지위를 얻은 현재 탭 리스트와 탭 랭킹박스
      // 3-1. 현재 탭 리스트 => current 클래스 획득
      $(this).addClass('current');
      // 3-2. 현재 탭 랭킹박스 => current 클래스 획득
      $('#' + tabDataId).addClass('current');
    });
  });

  /** HASHTAG RANK TAB 관련 JS **/
  $(document).ready(function () {
    // 1. 해시태그 랭킹 탭 위에 마우스를 올리면(hover)
    $('ul.hashtag-rank-tabs li').hover(function () {
      var tabDataId = $(this).attr('data-tab');

      // 2. '현재' 지위를 잃은 이전 탭 리스트와 탭 랭킹박스
      // 2-1. 이전 탭 리스트 => current 클래스 박탈
      $('ul.hashtag-rank-tabs li').removeClass('current');
      // 2-2. 이전 탭 랭킹박스 => current 클래스 박탈
      $('.tab-hashtag-box').removeClass('current');

      // 3. '현재' 지위를 얻은 현재 탭 리스트와 탭 랭킹박스
      // 3-1. 현재 탭 리스트 => current 클래스 획득
      $(this).addClass('current');
      // 3-2. 현재 탭 랭킹박스 => current 클래스 획득
      $('#' + tabDataId).addClass('current');
    });
  });

  /** TIME 표기 함수 **/
  const yyyymmdd = (date) => {
    // 1. 한국 시간 보정
    const korDate = Number(new Date(date));
    const start = new Date(korDate);
    const time = start.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    console.log(time.trim());
    return time;
  };

  /** 페이지 로딩이 되면 실행할 함수들 **/
  // 1. HOT LIVECHAT LIST
  fetchHotLiveChats(10);
  // 2. HOT POST RANKING LIST (완료)
  fetchHotPosts('CHAT');
  fetchHotPosts('FASHION');
  // 3. POINT RANKING LIST
  fetchWeeklyPointRank(10);
  fetchTotalPointRank(10);
  // 4. HASHTAG RANKING LIST
  fetchHashtagRank(10);

  /** 함수 전역 선언 **/
  window.clickLiveChat = clickLiveChat;
  window.clickPost = clickPost;
});

// 쇼핑 api 호출
async function fetchNaverShopping(keyword, rank) {
  try {
    const response = await fetch(`/api/shopping?keyword="${keyword}"`);
    const result = await response.json();
    appendNaverShoppingList(result.data, [rank], keyword); // 각 아이템에 순위 전달
  } catch (error) {
    console.error('Error fetching shopping data:', error);
  }
}

function appendNaverShoppingList(items, rank, keyword) {
  const shoppingList = document.getElementById('hash-shop-container');

  // 데이터 추가
  items.forEach((item) => {
    const listItem = document.createElement('div');
    listItem.innerHTML = `
      <div class="shopping-item-card">
        <div class="shopping-item-card-inner" onClick="window.open('${item.link}', '_blank')">
          <div class="card-rank">
            <span class="hashtag-rank-ranking-var">${rankMark(rank)}</span>
            <span class="keyword"># ${keyword}</span>
          </div>
          <div class="card-thumbnail">
            <img class="card-thumbnail-image" src="${item.image}" alt="${item.title}">
          </div>
          <div class="item-info">
            <div class="item-title">
              <span class="item-title-var">${item.title}</span>
            </div>
            <div class="item-mall">
              <span class="item-mall-var">${item.mallName}</span>
            </div>
            <div class="item-price">
              <span class="item-price-var">${item.lprice} 원</span>
            </div>
          </div>
        </div>
      </div>
    `;
    shoppingList.appendChild(listItem); // 리스트에 추가
  });
}