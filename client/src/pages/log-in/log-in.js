// pages/log-in/LogIn.js
import React from 'react';
import './styles/log-in.style.css';

const LogIn = () => {
  return (
    <div className="container">
      <h1>로그인</h1>
      <form>
        <label htmlFor="email">이메일 (Email)</label>
        <input
          type="email"
          id="email"
          placeholder="example@example.com"
          required
        />

        <label htmlFor="password">비밀번호 (Password)</label>
        <input type="password" id="password" placeholder="********" required />

        <button type="submit">로그인하기</button>
        <p className="forgot-password">
          아이디 또는 비밀번호를 잊으셨나요?
          <a href="./find-pw">찾기</a>
        </p>
      </form>
    </div>
  );
};

export default LogIn;
