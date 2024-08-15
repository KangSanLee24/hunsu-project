import { renderChatRooms } from './chat-list.js';

document.addEventListener('DOMContentLoaded', () => {
  const searchButton = document.getElementById('searchRoomButton');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');

  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    const sortOrder = sortSelect.value;

    console.log(query, sortOrder);
    const chatRooms = await searchChatRooms(query, sortOrder);
    renderChatRooms(chatRooms);
  });

  async function searchChatRooms(title, order) {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch(
        `/api/chatrooms/search?title=${encodeURIComponent(title)}&sort=${order}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const rooms = await response.json();

      const roomsWithDetails = await Promise.all(
        rooms.map(async (room) => {
          const [memberCountResponse, lastChatTimeResponse] = await Promise.all(
            [
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
            ]
          );

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
      console.error('Error fetching chat rooms:', error);
      return [];
    }
  }
});
