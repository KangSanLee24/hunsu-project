import { API_BASE_URL } from '../../config/config.js';

document.addEventListener('DOMContentLoaded', () => {
  /** 1. 페이지에 필요한 변수 세팅 **/
  // 1. 로그인 관련 변수 선언
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;
  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');
  // 2. 랭킹 관련 변수 선언
  const hotPostListChat = document.getElementById('tab-chat');
  const hotPostListFashion = document.getElementById('tab-fashion');
  const hotPostListCooking = document.getElementById('tab-cooking');

  /** 2. 로그인 상태에 따른 분기 세팅 **/
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

  /** HOT POST - [TYPE(CHAT, FASHION, COOKING)] 랭킹 **/
  async function fetchHotPosts(category) {
    try {
      // 1. API 호출 시 비어 있는 값을 포함하지 않도록 URL 구성
      const queryParams = new URLSearchParams({
        category: category,
      });

      // 2. fetch 받아오기 (HOT POSTS [TYPE] LIST)
      const response = await fetch(
        `${API_BASE_URL}/posts/hot?${queryParams.toString()}`,
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
      if (result.statusCode === 200) {
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

  /** HOT POST 랜더링 함수 **/
  function renderHotPostList(category, data) {
    // 1. 불러온 데이터를 하나하나 HTML화
    for (let i = 1; i <= data.length; i++) {
      // 1-1. 데이터로 row HTML 생성
      const row = document.createElement('div');
      row.innerHTML = `
            <div class="post-info">
              <div class="post-title">
                <span class="post-title-var">${data[i].title}</span>
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
        console.error('카테고리 분류에서 에러가 발생했습니다.');
      }
    }
  }

  /** 게시판 탭 관련 JS **/
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

  /** 포인트 랭킹 탭 관련 JS **/
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

  /** 해시태그 랭킹 탭 관련 JS **/
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

  /** 시간 표시 함수 **/
  const yyyymmdd = (date) => {
    // 1. 한국 시간 보정
    const korDate = Number(new Date(date)) + 1000 * 60 * 60 * 9;
    const start = new Date(korDate);
    const time = start.toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
    console.log(time.trim());
    return time;
  };

  /** WEEKLY RANK 등수 분류 **/

  /** TOTAL POINT 레벨 분류 **/

  /** 페이지 로딩이 되면 실행할 함수들 **/
  // 1. HOT LIVECHAT LIST
  // 2. HOT POST RANKING LIST (완료)
  fetchHotPosts('CHAT');
  fetchHotPosts('FASHION');
  fetchHotPosts('COOKING');
  // 3. POINT RANKING LIST
  // 4. HASHTAG RANKING LIST
});
