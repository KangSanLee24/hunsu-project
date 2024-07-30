export const USER_MESSAGES = {
  READ_ME: {
    SUCCESS: '내 정보 조회에 성공했습니다.',
  },
  UPDATE_ME: {
    SUCCESS: '내 정보 수정에 성공했습니다.',
    FAILURE: {
      NO_EMAIL: '변경할 이메일을 입력해 주세요.',
      NO_NICKNAME: '변경할 닉네임을 입력해 주세요.',
      EXISTING_NICKNAME: '이미 사용중인 닉네임입니다.',
    },
  },
  DELETE_ME: {
    NOT_FOUND: '회원이 존재하지 않습니다.',
    SUCCESS: '회원 탈퇴에 성공했습니다.',
    FAILURE: {
      NO_EMAIL: '삭제할 이메일을 입력해 주세요.',
      NO_PASSWORD: '삭제할 패스워드를 입력해 주세요.',
    },
  },
  READ: {
    SUCCESS: '사용자 정보 조회에 성공했습니다.',
    FAILURE: {
      NO_USER: '사용자 정보가 존재하지 않습니다.',
    },
  },
};
