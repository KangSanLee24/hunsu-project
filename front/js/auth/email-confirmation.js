if (
  !document.referrer.includes('sign-up.html') &&
  !document.referrer.includes('change-password.html') &&
  !document.referrer.includes('email-confirmation.html')
) {
  // alert(document.referrer);
  alert('잘못된 접근입니다.');
  window.location.href = './main.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const verifyEmailForm = document.getElementById('verify-email-form');
  if (!verifyEmailForm) {
    console.error('이메일 인증 폼을 찾을 수 없습니다.');
    return;
  }

  verifyEmailForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 폼 데이터 가져오기
    const email = document.getElementById('email').value;
    const token = document.getElementById('token').value;
    alert('token 값은 : ' + token);

    // 회원가입 이메일 인증
    if (document.referrer.includes('sign-up.html')) {
      try {
        const response = await fetch(`/api/auth/verify-email`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, certification: parseInt(token, 10) }),
        });

        const result = await response.json();

        if (response.ok && result.status === 200) {
          // 성공적인 응답 시 로그인 페이지로 이동
          alert('이메일 인증이 성공적으로 완료되었습니다.');
          window.location.href = './log-in.html';
        } else {
          // 오류 처리
          alert(result.message || '이메일 인증에 실패했습니다.');
        }
      } catch (error) {
        console.error('이메일 인증 요청 중 오류 발생:', error);
        alert('이메일 인증 요청 중 오류가 발생했습니다.');
      }

      // 비밀번호 변경
    } else if (document.referrer.includes('change-password.html')) {
      try {
        const response = await fetch(`/api/auth/verify-password`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, certification: parseInt(token, 10) }),
        });
        const result = await response.json();

        if (response.ok) {
          // 성공적인 응답 시 로그인 페이지로 이동
          alert(
            '이메일 인증이 성공적으로 완료되었습니다.\n비밀번호를 변경해 주십시오.'
          );
          event.preventDefault();
          window.location.href = './update-password.html';
        } else {
          // 오류 처리
          alert(result.message || '이메일 인증에 실패했습니다.');
        }
      } catch (error) {
        console.error('이메일 인증 요청 중 오류 발생:', error);
        alert('이메일 인증 요청 중 오류가 발생했습니다.');
      }
    }
  });
});
