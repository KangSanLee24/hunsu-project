import { fetchChatRooms, renderChatRooms } from './chat-list.js';

// 채팅방 생성 API 호출
async function createChatRoom(roomName) {
  try {
    const accessToken = localStorage.getItem('accessToken');

    console.log(accessToken);

    if (!accessToken) {
      const confirmLogin = confirm(
        '로그인이 되어있지 않습니다. 로그인을 하시겠습니까?'
      );
      if (confirmLogin) {
        // 현재 페이지 URL을 localStorage에 저장
        localStorage.setItem('currentPage', window.location.href);
        // 로그인 페이지로 리다이렉트하면서 리다이렉트 URL을 전달
        window.location.href = './log-in?redirect=/chat-list';
      }
      return; // accessToken이 없으면 함수 종료
    }

    const response = await fetch(`/api/chatrooms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: roomName }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('채팅방 생성 성공:', data);

      const roomId = data.id;
      const title = data.title;

      closeModal();
      //채팅방으로 이동
      window.location.href = `/chat?roomId=${roomId}&roomName=${encodeURIComponent(title)}`;
    } else {
      console.error('채팅방 생성 실패:', data);
    }
  } catch (error) {
    console.error('채팅방 생성 중 오류 발생:', error);
  }
}

// 모달 창 열기/닫기 및 이벤트 핸들러 설정
function setupChatRoomFormToggle() {
  const createChatButton = document.getElementById('createChatButton');
  const modalOverlay = document.getElementById('modalOverlay');
  const chatRoomForm = document.getElementById('chatRoomForm');
  const closeButton = document.getElementById('closeButton');
  const createButton = document.getElementById('createButton');
  const roomNameInput = document.getElementById('roomName');

  const accessToken = localStorage.getItem('accessToken');

  createChatButton.addEventListener('click', () => {
    if (accessToken) {
      modalOverlay.style.display = 'block';
      chatRoomForm.style.display = 'block';
    }
  });

  closeButton.addEventListener('click', () => {
    closeModal();
  });

  modalOverlay.addEventListener('click', () => {
    closeModal();
  });

  createButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName) {
      createChatRoom(roomName);
    } else {
      alert('채팅방 이름을 입력하세요.');
    }
  });
}

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const chatRoomForm = document.getElementById('chatRoomForm');
  modalOverlay.style.display = 'none';
  chatRoomForm.style.display = 'none';
}

// 초기화
setupChatRoomFormToggle();
