const submitUpdateProfileButton = document.getElementById('update-profile-btn');

// 현재 닉네임 표시 DOM
document.addEventListener('DOMContentLoaded', function () {
  const currentNicknameInput = document.getElementById('current-nickname');
  const nickname = localStorage.getItem('nickname');
  if (nickname) {
    currentNicknameInput.value = nickname;
  } else {
    alert('닉네임을 불러올 수 없습니다.');
    // window.location.href = document.referrer;
    window.location.href = './index';
  }
});

// 내 정보 수정 API 호출 함수
async function updateProfile() {
  const nickname = document.getElementById('nickname').value; // nickname 값을 가져옴

  // 닉네임 길이 체크
  if (nickname.length < 3 || nickname.length > 12) {
    alert('닉네임은 3글자 이상 12글자 이하로 입력해 주세요.');
    return; // 더 이상 진행하지 않음
  }
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ nickname }),
    });

    // 409 Conflict 닉네임 중복
    if (response.status === 409) {
      alert('현재 사용 중인 닉네임입니다. 다른 닉네임을 선택해 주세요.');
      return; // 더 이상 진행하지 않음

      // 닉네임 칸 비어있을때
    } else if (!nickname) {
      alert('변경할 닉네임을 적어주세요.');
      return; // 더 이상 진행하지 않음

      // 그 외
    } else if (!response.ok) {
      alert('닉네임 변경에 실패했습니다.');
      return; // 더 이상 진행하지 않음
    }

    const result = await response.json();

    // 성공적으로 업데이트된 경우 알림 표시
    if (result.status === 200) {
      alert('닉네임이 성공적으로 수정되었습니다.');
      window.location.href = './my-page';
    }
  } catch (error) {
    console.error('닉네임 변경 중 오류 발생:', error);
  }
}

// 회원 변경 이벤트 리스너 추가
submitUpdateProfileButton.addEventListener('click', (event) => {
  event.preventDefault();
  updateProfile();
});

// 페이지를 벗어날때 nickname을 localStorage에서 지운다.
window.addEventListener('beforeunload', () => {
  localStorage.removeItem('nickname');
});
