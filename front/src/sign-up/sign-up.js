// pages/sign-up/SignUp.js
import React, { useState } from 'react';
import API from '../../../client/src/shared/API';
import './styles/sign-up.style.css'; // CSS 파일 경로 확인 후 수정

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 회원 가입 정보 객체
    const signUpData = {
      email,
      password,
      passwordConfirm,
      nickname,
    };

    console.log('전송할 데이터:', signUpData); // 데이터 확인

    try {
      const response = await API.post(
        '/auth/sign-up',
        JSON.stringify(signUpData)
      );
      console.log(response); // 성공 응답 처리
      // 여기서 성공 후 처리 로직 추가 (예: 알림 메시지, 리디렉션 등)
    } catch (error) {
      console.error(
        '회원 가입 실패:',
        error.response ? error.response.data : error.message
      ); // 오류 응답 처리
      // 여기서 오류 처리 로직 추가 (예: 알림 메시지 표시)
    }
  };

  return (
    <div className="container1">
      <h1>회원 가입</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="signup-email">이메일 (Email)</label>
        <input
          type="email"
          id="signup-email"
          placeholder="example@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)} // 이메일 상태 업데이트
        />

        <label htmlFor="signup-password">비밀번호 (Password)</label>
        <input
          type="password"
          id="signup-password"
          placeholder="********"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)} // 비밀번호 상태 업데이트
        />

        <label htmlFor="confirm-signup-password">
          비밀번호 확인 (Password Confirm)
        </label>
        <input
          type="password"
          id="confirm-signup-password"
          placeholder="********"
          required
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)} // 비밀번호 확인 상태 업데이트
        />

        <label htmlFor="nickname">닉네임 (Nickname)</label>
        <input
          type="text"
          id="nickname"
          placeholder="홍길동"
          required
          value={nickname}
          onChange={(e) => setNickname(e.target.value)} // 닉네임 상태 업데이트
        />

        {/* <label htmlFor="extra">프로필 이미지(프로필)</label>
        <input type="text" id="extra" placeholder="imageUrl??" /> */}

        <button type="submit">회원 가입하기</button>
      </form>
    </div>
  );
};
export default SignUp;
