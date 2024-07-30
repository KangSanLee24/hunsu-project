import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/chat-list.css'

export function ChatList() {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    // 채팅방 목록 조회 api 호출 
    fetch('/api/chatrooms')
      .then(response => response.json())
      .then(data => {

        // 채팅방 인원수 api 호출
        Promise.all(data.map(room => 
          fetch(`/api/chatrooms/${room.id}/member-count`)
            .then(response => response.json())
            .then(memberCount => {
              // 마지막 채팅 시간 API 호출
              return fetch(`/api/chatrooms/${room.id}/chat-time`)
                .then(response => response.json())
                .then(lastChatTime => ({
                  ...room, 
                  memberCount, 
                  lastChatTime: lastChatTime.message
                }))
            })
        ))
        .then(chatWithInfo => {
          console.log(chatWithInfo);
          setChatRooms(chatWithInfo);
        });
      })
      .catch(error => console.error('Error fetching chat rooms:', error));
  }, []);

  return (
    <div className="chat-list">
      <h1>채팅</h1>
      <ul>
        {chatRooms.map((room, index) => (
          <li key={index}>
            <Link to={`/chat/${room.id}`}
                  state={{title: room.title}}
                  className="chat-list-link">
                <div className="chat-room-info">
                <span className="chat-room-name">{room.title}</span>
                <span className="chat-room-user">{room.user.nickname}</span>
                <span className="chat-room-count">
                  {room.memberCount.length > 0 ? `${room.memberCount[0].user_count} / 100` : '0 / 100'}</span>
                <span className="chat-room-time">{room.lastChatTime}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}