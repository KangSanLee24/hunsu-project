import { API_BASE_URL } from "../../config/config.js";
import { renderChatRooms } from "./chat-list.js";

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchRoomButton');
    const searchInput = document.getElementById('searchInput');

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (query) {
            const chatRooms = await searchChatRooms(query);
            renderChatRooms(chatRooms);
        }
    });

    async function searchChatRooms(title) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatrooms/search?title=${encodeURIComponent(title)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
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
            console.error('Error fetching chat rooms:', error);
            return [];
        }
    }
});