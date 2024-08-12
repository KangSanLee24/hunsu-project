export const COMMENT_MESSAGE = {
  COMMENT: {
    UNAUTHORIZED: '권한이 없습니다.',
    NO_POST: '게시글이 존재하지 않습니다.',
    NOT_FOUND: '댓글이 존재하지 않습니다.',
    // 댓글 생성
    CREATE: {
      SUCCESS: '댓글 생성에 성공하였습니다.',
      CONTENT_EMPTY: '내용을 입력해주세요.',
    },

    // 댓글 조회
    READ: {
      SUCCESS: '댓글 목록 조회에 성공하였습니다.',
    },
    // 댓글 수정
    UPDATE: {
      SUCCESS: '댓글 수정에 성공하였습니다.',
      FAILURE: {
        FORBIDDEN: '해당 댓글을 수정할 권한이 없습니다.',
      },
    },
    // 댓글 삭제
    DELETE: {
      SUCCESS: '댓글 삭제에 성공하였습니다.',
      FAILURE: {
        FORBIDDEN: '해당 댓글을 삭제할 권한이 없습니다.',
      },
    },
    // 댓글 강제 삭제
    FORCE_DELETE: {
      SUCCESS: '댓글 강제 삭제에 성공하였습니다.',
      FAILURE: {
        FORBIDDEN: '관리자 계정이 아닙니다.',
      },
    },
    // 이미지 업로드
    IMAGE: {
      UPLOAD: {
        SUCCESS: '이미지 업로드에 성공하였습니다.',
      },
    },
  },
  // 댓글 좋아요
  LIKE: {
    // 댓글 좋아요 조회
    FIND: {
      SUCCESS: '댓글 좋아요 조회에 성공하였습니다.',
    },
    // 댓글 좋아요 클릭
    CLICK: {
      SUCCESS: '댓글 좋아요 클릭에 성공하였습니다.',
      FAILURE: {
        NO_SELF: '자신의 댓글에 좋아요를 누를 수 없습니다.',
        ALREADY: '이미 좋아요를 누른 댓글입니다.',
        ALREADY_DISLIKE: '싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.',
      },
    },
  },
  // 댓글 싫어요
  DISLIKE: {
    // 댓글 싫어요 조회
    FIND: {
      SUCCESS: '댓글 싫어요 조회에 성공하였습니다.',
    },
    // 댓글 싫어요 클릭
    CLICK: {
      SUCCESS: '댓글 싫어요 클릭에 성공하였습니다.',
      FAILURE: {
        NO_SELF: '자신의 댓글에 싫어요를 누를 수 없습니다.',
        ALREADY: '이미 싫어요를 누른 댓글입니다.',
        ALREADY_LIKE: '좋아요를 누른 상태에서는 싫어요를 누를 수 없습니다.',
      },
    },
  },
};
