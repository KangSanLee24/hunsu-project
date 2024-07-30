import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Chat } from './pages/chat-room/chat.js';
import { ChatList } from './pages/chat-list/chat-list.js';
import { Main } from './pages/main/main.js';
import SignUp from './pages/sign-up/sign-up.js';
import LogIn from './pages/log-in/log-in.js';
import FindPassword from './pages/find-pw/find-pw.js';
import ResetPassword from './pages/reset-pw/reset-pw.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/log-in" element={<LogIn />} />
        <Route path="/find-pw" element={<FindPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat-list" element={<ChatList />} />
        <Route path="/chat-room/:roomId" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
