import { useState, useEffect, useLayoutEffect } from "react";
import { io } from "socket.io-client";

const socket = io('http://localhost:4000');

export function Chat({ }) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(generateUserName());

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
    if (e.key !== "Enter" || inputValue.trim().length === 0) return;

    console.log("Sending message:", inputValue);
    socket.emit("chat", { author: currentUser, body: inputValue });
    setInputValue("");
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <span>chatting room name</span>
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
          onKeyPress={handleSendMessage}
        />
      </div>
    </div>
  );
}