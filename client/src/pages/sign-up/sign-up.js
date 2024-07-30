// pages/sign-up/SignUp.js
import React from 'react';
import './styles/sign-up.style.css'; // CSS 파일 경로 확인 후 수정

const SignUp = () => {
  return (
    <div className="container1">
      <h1>회원 가입</h1>
      <form>
        <label htmlFor="signup-email">이메일 (Email)</label>
        <input
          type="email"
          id="signup-email"
          placeholder="example@example.com"
          required
        />

        <label htmlFor="signup-password">비밀번호 (Password)</label>
        <input
          type="password"
          id="signup-password"
          placeholder="********"
          required
        />

        <label htmlFor="confirm-signup-password">
          비밀번호 확인 (Password Confirm)
        </label>
        <input
          type="password"
          id="confirm-signup-password"
          placeholder="********"
          required
        />

        <label htmlFor="nickname">닉네임 (Nickname)</label>
        <input type="text" id="nickname" placeholder="홍길동" required />

        <label htmlFor="extra">뭘 추가하지? (What to add?)</label>
        <input type="text" id="extra" placeholder="imageUrl??" />

        <button type="submit">회원 가입하기</button>
      </form>
    </div>
  );
};
export default SignUp;
