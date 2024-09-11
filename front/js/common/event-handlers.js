export const clickAlarmBtn = function () {
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
  
export const clickMyPageBtn = function () {
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
  
export const clickCreatePostBtn = function () {
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