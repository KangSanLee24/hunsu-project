export const COMMENT_MESSAGE = {
  SUCCESS: {
    CREATE: '댓글 생성에 성공하셨습니다.', // CREATED 201
    GET: '댓글 목록 조회에 성공하셨습니다.', // OK 200
    UPDATE: '댓글 수정에 성공하셨습니다.', // OK 200
    DELETE: '댓글 삭제에 성공했습니다.', // OK 200
  },
  FAILURE: {
    NO_POST: '게시글이 존재하지 않습니다.', // NOTFOUND 404
    NO_COMMENT: '댓글이 존재하지 않습니다.', // NOTFOUND 404
    UN_AUTH: '댓글에 접근 권한이 없습니다.', // ForbiddenException 403
  },
  ETC: {
    DELETED_COMMENT: '삭제된 댓글입니다.',
  },
};
