import { useState, useEffect, useLayoutEffect } from "react";
import { useLocation } from 'react-router-dom';
import { io } from "socket.io-client";

const socket = io('http://localhost:4000');

export function Chat({ }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(generateUserName());

  const location = useLocation(); // 링크에서 전달된 상xo

  function generateUserName() {
    const count = Math.floor(Math.random() * 1000) + 1;
    return `가나다${count}`;
  };

  useEffect(() => {

    // 이벤트 리스너 등록
    const handleMessage = (newMessage) => {
      console.log("New message received:", newMessage);
      setMessages((previousMessages) => [...previousMessages, newMessage]);
    };

    socket.on("chat", handleMessage);

    return () => {
      socket.off("chat", handleMessage);
    };

  }, []);

  useLayoutEffect(() => {
    let chat = document.querySelector('#chatscroll');
    chat.scrollTop = chat.scrollHeight;
  }, [messages]);

  const handleSendMessage = (e) => {
    if (inputValue.trim().length === 0) return;

    console.log("Sending message:", inputValue);
    socket.emit("chat", { author: currentUser, body: inputValue });
    setInputValue("");
  };

  const handleEnterMessage = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }

  return (
    <div className="chat">
      <div className="chat-header">
        <span className="chatting room name">
          {location.state.title}
        </span>
        <button className="button" >
          나가기
        </button>
      </div>
      <div className="chat-message-list" id = "chatscroll" style={{overflow:"auto"}} >
        {messages.map((message, idx) => (
          <div
          key={idx}
          className={`chat-message ${
            currentUser === message.author ? "outgoing" : ""
          }`}
        >
          <div className="chat-message-wrapper">
            <span className="chat-message-author">{message.author}</span>
            <div className="chat-message-bubble">
              <span className="chat-message-body">{message.body}</span>
            </div>
            </div>
          </div>
        ))}
      </div>
      <div className="chat-composer">
        <input
          className="chat-composer-input"
          placeholder="메세지를 입력해주세요."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleEnterMessage}
        />
         <button className="send-button" onClick={handleSendMessage}>
          전송
        </button>
      </div>
    </div>
  );
}