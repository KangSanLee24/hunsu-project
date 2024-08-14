import React from 'react';
import './styles/find-pw.style.css';

const FindPassword = () => {
  const handleEmail = (event) => {
    event.preventDefault();
    const email = event.target.elements['send-email'].value;
    //
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // 비밀번호 찾기 로직 처리
    const email = event.target.elements['send-email'].value;
    const token = event.target.elements['find-password-token'].value;

    //
  };

  return (
    <div className="container">
      <h1>비밀번호 찾기</h1>

      <div className="form-section">
        <form id="send-email-form" onSubmit={handleEmail}>
          <label htmlFor="send-email">이메일:</label>
          <input
            type="email"
            id="send-email"
            placeholder="example@example.com"
            required
          />
          <button type="submit">인증 번호 발송</button>
        </form>
        <form id="find-password-form" onSubmit={handleSubmit}>
          <label htmlFor="find-password-token">인증 번호:</label>
          <input
            type="text"
            id="find-password-token"
            placeholder="000000"
            required
          />
          <button type="submit">비밀번호 찾기</button>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;
