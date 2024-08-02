export enum PointType {
  ATTENTION = 'ATTENTION', // 출석 체크
  SIGN_UP = 'SIGN_UP', // 회원 가입
  WEEKLY_ATTENTION = 'WEEKLY_ATTENTION', // 7일 연속 출석
  POST = 'POST', // 게시글 작성 일일 최대 10
  COMMENT = 'COMMENT', // 댓글 작성 일일 최대 10
  POST_LIKE = 'POST_LIKE', // 게시글 좋아요 일일 최대 5
  COMMENT_LIKE = 'COMMENT_LIKE', // 댓글 좋아요 최대 10
}

export enum PointScore {
  ATTENTION = 20, // 출석 체크
  SIGN_UP = 50, // 회원 가입
  WEEKLY_ATTENTION = 20, // 7일 연속 출석
  POST = 5, // 게시글 작성 일일 최대 10
  COMMENT = 2, // 댓글 작성 일일 최대 10
  POST_LIKE = 1, // 게시글 좋아요 일일 최대 5
  COMMENT_LIKE = 1, // 댓글 좋아요 최대 10
}

export enum MaxPointScore {
  ATTENTION = 20, // 출석 체크
  SIGN_UP = 50, // 회원 가입
  WEEKLY_ATTENTION = 20, // 7일 연속 출석
  POST = 10, // 게시글 작성 일일 최대 10
  COMMENT = 10, // 댓글 작성 일일 최대 10
  POST_LIKE = 5, // 게시글 좋아요 일일 최대 5
  COMMENT_LIKE = 10, // 댓글 좋아요 최대 10
}
