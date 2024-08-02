export const AUTH_MESSAGES = {
  SIGN_UP: {
    SUCCESS:
      '가입하신 이메일 주소로 인증 메일을 발송하였습니다. 인증을 완료하시면 아래 정보로 회원 가입이 완료됩니다.',
    FAILURE: {
      NOT_MATCHED: '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      NO_EMAIL: '가입할 이메일을 입력해 주세요.',
      NO_NICKNAME: '닉네임을 입력해 주세요.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      NO_PASSWORD_CONFIRM: '비밀번호 확인을 입력해 주세요.',
      EXISTING_EMAIL: '이미 사용중인 이메일입니다.',
      EXISTING_NICKNAME: '이미 사용중인 닉네임입니다.',
      RESTORE: '해당 계정은 복구 대상입니다.',
      ETC: '회원 가입 중 알 수 없는 에러가 발생했습니다. 다시 시도해 주세요.',
    },
  },
  VERIFY_EMAIL: {
    SUCCESS: '이메일 인증에 성공했습니다.',
    FAILURE: {
      NO_EMAIL: '인증할 이메일을 입력해 주세요.',
      WRONG_EMAIL:
        '이메일을 잘못 입력하셨거나, 회원 가입 신청이 되지 않은 이메일입니다.',
      NO_CERTIFICATION: '인증번호 4자리를 입력해 주세요.',
      WRONG_CERTIFICATION:
        '인증번호를 잘못 입력하셨습니다. 다시 확인해 주세요.',
      SEND_ERROR: '인증 메일 전송 중 오류가 발생했습니다. 다시 시도해 주세요.',
      TIME_OUT: '이메일 인증 제한시간이 초과되었습니다. 다시 시도해 주세요.',
    },
  },
  LOG_IN: {
    SUCCESS: '로그인에 성공했습니다.',
    FAILURE: {
      NO_USER: '가입되지 않은 사용자입니다.',
      NO_EMAIL: '이메일을 입력해 주세요.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      WRONG_PASSWORD: '비밀번호가 일치하지 않습니다.',
      NOT_VERIFIED:
        '아직 이메일 인증을 하지 않으셨습니다. 이메일 인증을 진행해 주세요.',
    },
  },
  LOG_OUT: {
    SUCCESS: '로그아웃에 성공했습니다.',
    FAILURE: {
      NO_TOKEN: '이미 로그아웃 된 상태입니다.',
    },
  },
  FIND_ID: {
    SUCCESS: '아이디 찾기에 성공했습니다.',
    FAILURE: {
      NO_USER: '존재하지 않는 유저입니다.',
    },
  },
  RE_PASSWORD: {
    SUCCESS: '비밀번호 변경 인증번호를 전송했습니다.',
    FAILURE: {
      NO_USER: '존재하지 않는 유저입니다.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      NOT_VERIFIED: '가입이 완료되지 않아 비밀번호 변경을 진행할 수 없습니다.',
    },
  },
  VERIFY_PASSWORD: {
    SUCCESS: '비밀번호 변경 이메일 인증에 성공했습니다.',
    FAILURE: {
      WRONG_EMAIL: '이메일을 잘못 입력하셨습니다. 다시 확인해 주세요.',
      WRONG_CERTIFICATION:
        '인증번호를 잘못 입력하셨습니다. 다시 확인해 주세요.',
      SEND_ERROR: '인증 메일 전송 중 오류가 발생했습니다. 다시 시도해 주세요.',
      TIME_OUT: '이메일 인증 제한시간이 초과되었습니다. 다시 시도해 주세요.',
      NO_EMAIL: '인증할 이메일을 입력해 주세요.',
      NO_CERTIFICATION: '인증번호 4자리를 입력해 주세요.',
    },
  },
  UPDATE_PASSWORD: {
    SUCCESS: '비밀번호 변경에 성공하였습니다!',
    FAILURE: {
      NO_VERIFYING: '비밀번호 변경 인증이 진행중이지 않은 이메일입니다.',
      NO_CERTIFIED: '비밀번호 변경 인증이 완료되지 않았습니다.',
      PASSWORD_MISMATCH:
        '입력하신 비밀번호와 비밀번호확인이 일치하지 않습니다.',
      NO_EMAIL: '이메일을 입력해주세요.',
      NO_PASSWORD: '비밀번호를 입력해 주세요.',
      NO_PASSWORD_CONFIRM: '비밀번호 확인을 입력해 주세요.',
    },
  },
  JWT: {
    FAILURE: {
      NO_USER: '사용자를 찾을 수 없습니다.',
    },
  },
  RE_TOKEN: {
    SUCCESS: '토큰 재발급에 성공했습니다.',
    FAILURE: {
      INVALID_TOKEN: '리프레시 토큰이 유효하지 않습니다',
      NOT_MATCHED_EMAIL: '다른 사용자의 리프레시 토큰을 사용하셨습니다.',
      NO_REFRESH_TOKEN: '리프레시 토큰이 없습니다. 다시 로그인 해주세요.',
      NOT_MATCHED_REFRESH_TOKEN: '잘못된 리프레시 토큰입니다.',
      NOT_SUPPORTED_TOKEN: '지원되지 않는 형식의 토큰입니다.',
      NOT_REFRESH_TOKEN: '리프레시 토큰이 아닙니다. 다시 확인해 주세요.',
    },
  },
};
