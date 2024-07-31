import { API_BASE_URL } from "../../config/config.js";

//채팅 목록 가져오기
export async function fetchChatRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/chatrooms`);
      const rooms = await response.json();
      
      const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
        const [memberCountResponse, lastChatTimeResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/chatrooms/${room.id}/member-count`),
          fetch(`${API_BASE_URL}/chatrooms/${room.id}/chat-time`)
        ]);
        
        const memberCount = await memberCountResponse.json();
        const lastChatTime = await lastChatTimeResponse.json();
        
        return {
          ...room,
          memberCount: memberCount.length > 0 ? memberCount[0].user_count : 0,
          lastChatTime: lastChatTime.message
        };
      }));
      
      return roomsWithDetails;
    } catch (error) {
      console.error('채팅방 데이터를 가져오는 중 오류 발생:', error);
      return [];
    }
  }
  
//목록 화면에 뿌리기
export function renderChatRooms(chatRooms) {
const chatListElement = document.getElementById('chatList');
chatListElement.innerHTML = ""; // 기존 목록 초기화

chatRooms.forEach((room, index) => {
    let tempHTML = `
    <ul>
        <li key=${index}>
        <a href="/html/chat.html?roomId=${room.id}&roomName=${encodeURIComponent(room.title)}" class="chat-list-link">
            <div className="chat-room-info">
                <span className="chat-room-name">${room.title}</span>
                <span className="chat-room-user">${room.user.nickname}</span>
                <span className="chat-room-count">${room.memberCount} / 100</span>
                <span className="chat-room-time">${room.lastChatTime}</span>
            </div>
            </Link>
        </li>
    </ul>
    `;

    chatListElement.insertAdjacentHTML('beforeend', tempHTML);
});
}

//초기화 및 렌더링
(async function init() {
const chatRooms = await fetchChatRooms();
renderChatRooms(chatRooms);
})();
  