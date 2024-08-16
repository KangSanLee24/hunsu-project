const updatePasswordBtn = document.getElementById('update-password-btn');

// 비밀번호 변경 API 호출 함수
async function updatePassword() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('password-confirm').value;
  try {
    // 비밀번호 변경 API
    const response = await fetch(`/api/auth/update-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, passwordConfirm }),
    });


    const result = await response.json();

    // 409
    if (result.status = 409) {
      alert('새 비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 그 외
    else if (!response.ok) {
      alert('비밀번호 변경에 실패했습니다.');
      return; // 더 이상 진행하지 않음
    }

    // // 확인 버튼 클릭 시 페이지 이동
    // alert('이메일이 전송되었습니다.');
    // window.location.href = './email-confirmation.html';
    // 사용자 정의 알림 표시
    const notification = document.getElementById('notification');
    const confirmBtn = document.getElementById('confirm-btn');
    notification.classList.remove('hidden');

    // 확인 버튼 클릭 시 페이지 이동
    confirmBtn.addEventListener('click', () => {
      window.location.href = './log-in.html';
    });
  } catch (error) {
    console.error('비밀번호 변경 중 오류 발생:', error);
  }
}

// 회원 변경 이벤트 리스너 추가
updatePasswordBtn.addEventListener('click', (event) => {
  event.preventDefault();
  updatePassword();
});
