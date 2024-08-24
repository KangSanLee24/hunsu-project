document.addEventListener('DOMContentLoaded', () => {
  const verifyEmailForm = document.getElementById('verify-email-form');
  if (!verifyEmailForm) {
    console.error('이메일 인증 폼을 찾을 수 없습니다.');
    return;
  }

  const emailInput = document.getElementById('email');
  const storedEmail = localStorage.getItem('email');
  if (storedEmail && emailInput) {
    emailInput.value = storedEmail;
  }

  verifyEmailForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    // 폼 데이터 가져오기
    // 이메일, 인증번호
    const email = emailInput.value;
    const token = document.getElementById('token').value;

    // 이전 페이지 여부로 회원가입, 비밀번호 변경때 다른 API 호출
    // 회원가입 이메일 인증
    if (document.referrer.includes('sign-up')) {
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
          alert('이메일 인증이 성공적으로 완료되었습니다.\n회원가입으로 인한 포인트 50점이 지급됩니다.');
          window.location.href = './log-in';
        } else {
          // 오류 처리
          alert(result.message || '이메일 인증에 실패했습니다.');
        }
      } catch (error) {
        console.error('이메일 인증 요청 중 오류 발생:', error);
        alert('이메일 인증 요청 중 오류가 발생했습니다.');
      }

      // 비밀번호 변경
    } else if (document.referrer.includes('change-password')) {
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
          window.location.href = './update-password';
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
