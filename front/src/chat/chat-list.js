//채팅 목록

async function fetchChatRooms() {
    try {
      const response = await fetch('http://localhost:3000/api/chatrooms');
      const rooms = await response.json();
      
      const roomsWithDetails = await Promise.all(rooms.map(async (room) => {
        const [memberCountResponse, lastChatTimeResponse] = await Promise.all([
          fetch(`http://localhost:3000/api/chatrooms/${room.id}/member-count`),
          fetch(`http://localhost:3000/api/chatrooms/${room.id}/chat-time`)
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
  

function renderChatRooms(chatRooms) {
const chatListElement = document.getElementById('chatList');
chatListElement.innerHTML = ""; // 기존 목록 초기화

chatRooms.forEach((room, index) => {
    let tempHTML = `
    <ul>
        <li key=${index}>
        <a href="http://localhost:3000/chat.html?roomId=${room.id}&roomName=${encodeURIComponent(room.title)}" class="chat-list-link">
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
  