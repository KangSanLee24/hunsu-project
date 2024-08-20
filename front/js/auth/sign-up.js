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

    if (nickname.length < 3 || nickname.length > 12) {
      alert('닉네임은 3글자 이상 12글자 이하로 입력해 주세요.');
      return;
    }

    try {
      const response = await fetch(`/api/auth/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source-Page': 'sign-up' // 커스텀 헤더 추가
        },
        body: JSON.stringify({ email, password, passwordConfirm, nickname }),
      });

      const result = await response.json();

      if (result.status === 201) {
        // 사용자 정의 알림 표시
        const notification = document.getElementById('notification');
        const confirmBtn = document.getElementById('confirm-btn');
        notification.classList.remove('hidden');

        localStorage.setItem('email', email);

        // 확인 버튼 클릭 시 페이지 이동
        confirmBtn.addEventListener('click', () => {
          window.location.href = './email-confirmation';
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
