/** 로그인 페이지에 필요한 변수 선언 **/
const naverLogInBtn = document.getElementById('naver_login');

/** 로그인 **/
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  // 로그인 폼이 존재하는 경우
  if (loginForm) {
    /** 일반 로그인 **/
    // 1. [로그인하기] 버튼을 누르면 [일반 로그인] 수행
    loginForm.addEventListener('submit', async (event) => {
      // 1-0. 기존 동작 방지(submit의 경우 입력된 데이터 쿼리화 방지)
      event.preventDefault();

      // 1-1. input에 입력된 email과 password 가져오기
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      // 1-2. 로그인API request 요청 => response로 받아오기
      const response = await fetch(`/api/auth/log-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      // 1-3. response를 json화
      const result = await response.json();

      // 1-4. 로그인 관련 데이터 처리
      if (response.ok && result.status === 200) {
        // 1-4-A. 로그인 성공시 + 이메일 인증O
        // 1-4-A-1. 토큰들 로컬스토리지에 저장
        localStorage.setItem('accessToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);

        // 출석 체크 API 호출
        const attendanceResult = await checkAttendance(result.data.accessToken);
        console.log('출석 체크 호출 결과:', attendanceResult);

        // 1-4-A-2. '로그인에 성공했습니다.' alert
        // alert(result.message);

        // // 메인 페이지로 이동
        // window.location.href = './index';

        // localstorage에서 redirectUrl 가져오기
        const redirectUrl = localStorage.getItem('redirectUrl') || './index';

        // 리다이렉트 URL로 이동
        window.location.href = redirectUrl;
        // window.location.href = document.referrer;

        // 리다이렉트 후 localStorage에서 redirectUrl 삭제
        localStorage.removeItem('redirectUrl');
      } else if (
        // 1-4-B. 로그인 성공시 + 이메일 인증X
        result.message ===
        '아직 이메일 인증을 하지 않으셨습니다. 이메일 인증을 진행해 주세요.'
      ) {
        // 1-4-B-1. 위 메시지 alert
        alert(result.message);
        // 1-4-B-2. 이메일 인증 페이지로 이동
        window.location.href = './email-confirmation';
      } else {
        // 1-4-C. 기타 로그인 에러 처리
        alert(result.message || '로그인에 실패했습니다.');
      }
    });

    /** 네이버 로그인 **/
    // [N] 버튼을 누르면 [네이버 로그인] 수행
    naverLogInBtn.addEventListener('click', async (event) => {
      // 1. 기존 동작 방지
      event.preventDefault();
      // 2. 네이버 로그인 API 실행
      window.location.href = `/api/auth/log-in/naver`;
    });
  }
});

// 출석 체크 함수
async function checkAttendance(accessToken) {
  try {
    const response = await fetch(`/api/points/today`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();
    console.log('출석 체크 API 응답:', result);

    if (!response.ok) {
      throw new Error('출석 체크에 실패했습니다.');
    }

    return result;
  } catch (error) {
    console.error('Error during attendance check:', error);
    return { error: error.message };
  }
}
