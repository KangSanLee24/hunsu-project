document.addEventListener('DOMContentLoaded', () => {
  const verifyEmailForm = document.getElementById('verify-email-form');
  if (!verifyEmailForm) {
    console.error('이메일 인증 폼을 찾을 수 없습니다.');
    return;
  }

  verifyEmailForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // 폼의 기본 동작을 막습니다.

    // 폼 데이터 가져오기
    const email = document.getElementById('email').value;
    const token = document.getElementById('token').value;

    try {
      console.log(
        '🚀 ~ verifyEmailForm.addEventListener ~ JSON.stringify({ email, token }:',
        JSON.stringify({ email, token })
      );

      const response = await fetch(
        'http://localhost:4000/api/auth/verify-email',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, certification: parseInt(token, 10) }),
        }
      );

      const result = await response.json();

      if (response.ok && result.status === 200) {
        // 성공적인 응답 시 로그인 페이지로 이동
        alert('이메일 인증이 성공적으로 완료되었습니다.');
        window.location.href = './log-in.html'; // 로그인 페이지로 이동
      } else {
        // 오류 처리
        alert(result.message || '이메일 인증에 실패했습니다.');
      }
    } catch (error) {
      console.error('이메일 인증 요청 중 오류 발생:', error);
      alert('이메일 인증 요청 중 오류가 발생했습니다.');
    }
  });
});
