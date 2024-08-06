// pages/reset-password/ResetPassword.js
import React from 'react';
import './styles/reset-pw.style.css'; // CSS 파일 경로 확인 후 수정

const ResetPassword = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const newPassword = event.target.elements['new-password'].value;
    const confirmPassword = event.target.elements['confirm-password'].value;

    // 비밀번호 변경 로직 처리
    if (newPassword === confirmPassword) {
      console.log('비밀번호가 변경되었습니다:', newPassword);
      //
    } else {
      console.error('비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="container">
      <h1>비밀번호 변경</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-password">새 비밀번호 (New password)</label>
        <input
          type="password"
          id="new-password"
          placeholder="********"
          required
        />

        <label htmlFor="confirm-password">
          새 비밀번호 확인 (Confirm new password)
        </label>
        <input
          type="password"
          id="confirm-password"
          placeholder="********"
          required
        />

        <button type="submit">변경하기</button>
      </form>
    </div>
  );
};

export default ResetPassword;
