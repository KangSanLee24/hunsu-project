const submitDeleteProfileButton = document.getElementById('delete-profile-btn');

// 현재 닉네임, 이메일 표시 DOM
document.addEventListener('DOMContentLoaded', function (event) {
  const nicknameInput = document.getElementById('nickname');
  const nickname = localStorage.getItem('nickname');
  const emailInput = document.getElementById('email');
  const email = localStorage.getItem('email');

  if (nickname && email) {
    nicknameInput.value = nickname;
    emailInput.value = email;
  } else {
    alert('정보를 불러오는 과정에서 에러가 발생했습니다.');
    // window.location.href = document.referrer;
    window.location.href = './index';
  }
});

// 회원 탈퇴 API 호출 함수
async function deleteProfile() {
  const email = document.getElementById('email').value; // email 값을 가져옴
  const password = document.getElementById('password').value; // password 값을 가져옴
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ email, password }),
    });
    if (!password) {
      alert('비밀번호를 적어주세요.');
      return; // 더 이상 진행하지 않음

      // 그 외
    } else if (!response.ok) {
      alert('회원 탈퇴에 실패했습니다.');
      return; // 더 이상 진행하지 않음
    }

    const result = await response.json();

    // 성공적으로 업데이트된 경우 알림 표시
    if (result.status === 200) {
      alert(
        '회원 탈퇴가 완료되었습니다.\n계정복구에 대한 건은 운영자에게 문의하여 주시기 바랍니다.'
      );

      // 회원 탈퇴 후 로컬스토리지 token 값 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      window.location.href = './index';
    }
  } catch (error) {
    console.error('회원 탈퇴 중 오류 발생:', error);
  }
}

// 회원 변경 이벤트 리스너 추가
submitDeleteProfileButton.addEventListener('click', (event) => {
  event.preventDefault();
  deleteProfile();
});

// 페이지를 벗어날때 nickname을 localStorage에서 지운다.
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('nickname');
  localStorage.removeItem('email');
});
