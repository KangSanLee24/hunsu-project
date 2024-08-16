//채팅 목록 가져오기
export async function fetchChatRooms() {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`/api/chatrooms`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`, // 토큰을 헤더에 추가
        'Content-Type': 'application/json', // 필요에 따라 Content-Type 추가
      },
    });
    const rooms = await response.json();

    const roomsWithDetails = await Promise.all(
      rooms.map(async (room) => {
        const [memberCountResponse, lastChatTimeResponse] = await Promise.all([
          fetch(`/api/chatrooms/${room.id}/member-count`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
          fetch(`/api/chatrooms/${room.id}/chat-time`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }),
        ]);

        const memberCount = await memberCountResponse.json();
        const lastChatTime = await lastChatTimeResponse.json();

        return {
          ...room,
          memberCount: memberCount.length > 0 ? memberCount[0].user_count : 0,
          lastChatTime: lastChatTime.message,
        };
      })
    );

    return roomsWithDetails;
  } catch (error) {
    console.error('채팅방 데이터를 가져오는 중 오류 발생:', error);
    return [];
  }
}

//목록 화면에 뿌리기
export function renderChatRooms(chatRooms) {
  const chatListElement = document.getElementById('chatList');
  chatListElement.innerHTML = ''; // 기존 목록 초기화

  chatRooms.forEach((room, index) => {
    let tempHTML = `
  <ul>
      <li key=${index}>
      <a href="/chat?roomId=${room.id}&roomName=${encodeURIComponent(room.title)}" class="chat-list-link">
          <div class="chat-room-info" style="display: flex; justify-content: space-between; align-items: center;">
              <span class="chat-room-name">${room.title}</span>
              <span class="chat-room-user">${room.user.nickname}</span>
              <span class="chat-room-count">${room.memberCount} / 100</span>
              <span class="chat-room-time">${room.lastChatTime}</span>
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
