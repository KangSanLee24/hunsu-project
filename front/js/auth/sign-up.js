document.addEventListener('DOMContentLoaded', () => {
  const signUpForm = document.querySelector('form');
  if (!signUpForm) {
    console.error('회원가입 폼을 찾을 수 없습니다.');
    return;
  }

  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById(
      'confirm-signup-password'
    ).value;
    const nickname = document.getElementById('nickname').value;

    if (password !== passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      console.log(
        '🚀 ~ signUpForm.addEventListener ~ JSON.stringify({ email, password, passwordConfirm, nickname }:',
        JSON.stringify({ email, password, passwordConfirm, nickname })
      );

      const response = await fetch('http://localhost:4000/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, passwordConfirm, nickname }),
      });

      const result = await response.json();

      if (result.status === 201) {
        // 사용자 정의 알림 표시
        const notification = document.getElementById('notification');
        const confirmBtn = document.getElementById('confirm-btn');
        notification.classList.remove('hidden');

        // 확인 버튼 클릭 시 페이지 이동
        confirmBtn.addEventListener('click', () => {
          window.location.href = './email-confirmation.html';
        });
      } else {
        // 오류 처리
        alert(result.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 요청 중 오류 발생:', error);
      alert('회원가입 요청 중 오류가 발생했습니다.');
    }
  });
});
