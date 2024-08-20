const sendEmailBtn = document.getElementById('send-email-btn');

// 비밀번호 변경 요청
// const email = document.getElementById('change-password-email');

// 비밀번호 변경 요청 API 호출 함수
async function rePassword() {
  const email = document.getElementById('change-password-email').value;
  try {
    // 비밀번호 변경 요청 API
    const response = await fetch(`/api/auth/re-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source-Page': 'password-update' // 커스텀 헤더 추가
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message);
      return; // 더 이상 진행하지 않음
    }

    // // 확인 버튼 클릭 시 페이지 이동
    // alert('이메일이 전송되었습니다.');
    // window.location.href = './email-confirmation';
    // 사용자 정의 알림 표시
    const notification = document.getElementById('notification');
    const confirmBtn = document.getElementById('confirm-btn');
    notification.classList.remove('hidden');

    // 확인 버튼 클릭 시 페이지 이동
    confirmBtn.addEventListener('click', () => {
      window.location.href = './email-confirmation';
    });
  } catch (error) {
    console.error('이메일 전송 중 오류 발생:', error);
  }
}

// 회원 변경 이벤트 리스너 추가
sendEmailBtn.addEventListener('click', (event) => {
  event.preventDefault();
  rePassword();
});
