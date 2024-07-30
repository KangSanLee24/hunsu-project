import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../shared/styles/util.style.css';
import './styles/chat-list.css';

export function ChatList() {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    // 채팅방 조회 api 호출
    fetch('/api/chatrooms')
      .then((response) => response.json())
      .then((data) => {
        console.log('Fetched chat rooms:', data); // 데이터 확인용 로그
        setChatRooms(data);
      })
      .catch((error) => console.error('Error fetching chat rooms:', error));
  }, []);

  return (
    <div className="chat-list">
      <h1>채팅</h1>
      <ul>
        {chatRooms.map((room, index) => (
          <li key={index}>
            <Link
              to={`/chat/${room.id}`}
              state={{ title: room.title }}
              className="chat-list-link"
            >
              <div className="chat-room-info">
                <span className="chat-room-name">{room.title}</span>
                <span className="chat-room-user">{room.user.nickname}</span>
                <span className="chat-room-time">{room.createdAt}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
