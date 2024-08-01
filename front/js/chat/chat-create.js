import { API_BASE_URL } from "../../config/config.js";
import { fetchChatRooms, renderChatRooms } from "./chat-list.js";

// 채팅방 생성 API 호출
async function createChatRoom(roomName) {
    try {
        const response = await fetch(`${API_BASE_URL}/chatrooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: roomName })
        });

        const data = await response.json();
        if (response.ok) {
            console.log('채팅방 생성 성공:', data);
            closeModal();

            const roomId = data.roomId;
            const title = data.title;
            //채팅방으로 이동
            window.location.href = `/html/chat.html?roomId=${roomId}&roomName=${encodeURIComponent(title)}`;
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

    createChatButton.addEventListener('click', () => {
        modalOverlay.style.display = 'block';
        chatRoomForm.style.display = 'block';
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
