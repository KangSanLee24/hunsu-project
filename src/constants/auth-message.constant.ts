export const AUTH_MESSAGES = {
  SIGN_UP: {
    SUCCESS: '회원 가입에 성공했습니다.',
    FAILURE: {
      NOT_MATCHED: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      NO_EMAIL: '가입할 이메일을 입력해 주세요.',
      NO_NICKNAME: '닉네임을 입력해 주세요.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      NO_PASSWORD_CONFIRM: '비밀번호 확인을 입력해 주세요.',
      EXISTING_EMAIL: '이미 사용중인 이메일입니다.',
      EXISTING_NICKNAME: '이미 사용중인 닉네임입니다.',
      ETC: '회원 가입 중 알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.',
    },
  },
  LOG_IN: {
    SUCCESS: '로그인에 성공했습니다.',
    FAILURE: {
      NO_USER: '가입되지 않은 사용자입니다.',
      NO_EMAIL: '이메일을 입력해 주세요.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      WRONG_PASSWORD: '비밀번호가 일치하지 않습니다.',
    },
  },
  JWT: {
    FAILURE: {
      NO_USER: '사용자를 찾을 수 없습니다.',
    },
  },
};
