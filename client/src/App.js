import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Chat } from './chat/chat.js';
import { ChatList } from './chat/chat-list.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatList />} />
        <Route path="/chat/:roomId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;