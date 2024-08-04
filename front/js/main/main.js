document.addEventListener('DOMContentLoaded', () => {
  const liveChatData = [];
  const weeklyPostsData = [];

  /** 1. 페이지에 필요한 변수 세팅 **/
  // 1. 로그인 관련 변수 선언
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;
  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');

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

  /**  **/

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
});
