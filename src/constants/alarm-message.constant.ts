export const ALARM_MESSAGES = {
  CREATE: {
    SUCCESS: '알람 생성에 성공했습니다.',
    FAILURE: '알람 생성에 실패했습니다.',
    MESSAGE_POST: '내 게시글에 새로운 댓글이 달렸습니다.',
    MESSAGE_COMMENT: '내 댓글에 새로운 대댓글이 달렸습니다.',
    MESSAGE_LIVECHAT: '???',
  },
  READ_LIST: {
    SUCCESS: '알람 목록 조회에 성공했습니다.',
    FAILURE: {},
  },
  CLICK: {
    SUCCESS: '알람을 확인하셨습니다.',
    FAILURE: {
      NO_ALARM: '해당 알람 링크를 사용할 수 없습니다.',
    },
  },
  UPDATE: {
    SUCCESS: '해당 알람의 [읽음O]/[읽음X] 상태가 변경되었습니다.',
    FAILURE: {
      NO_ALARM: '[읽음O]/[읽음X] 상태를 변경할 수 있는 알람이 없습니다.',
    },
  },
  UPDATE_ALL: {
    SUCCESS: '모든 알람이 [읽음]으로 처리되었습니다.',
  },
  DELETE: {
    SUCCESS: '알람 삭제에 성공했습니다.',
    FAILURE: {
      NO_ALARM: '삭제할 수 있는 알람이 없습니다.',
    },
  },
  DELETE_ALL: {
    SUCCESS: '[읽음]상태의 알람들을 모두 삭제했습니다.',
  },
  ALARM_CREATED: {
    NEW: '새로운 알람이 등록되었습니다!',
  },
};
