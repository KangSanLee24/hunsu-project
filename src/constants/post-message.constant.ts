import { Delete } from '@nestjs/common';

export const POST_MESSAGE = {
  POST: {
    NOT_FOUND: '존재하지 않는 게시글입니다.',
    // 게시글 생성
    CREATE: {
      SUCCESS: '게시글 생성에 성공하였습니다.',
      TITLE_EMPTY: '게시글 제목을 입력해주세요.',
      CONTENT_EMPTY: '내용을 입력해주세요.',
      CATEGORY_EMPTY: '카테고리를 입력해주세요.',
    },

    // 게시글 목록 조회
    READ_ALL: {
      SUCCESS: '게시글 목록 조회에 성공하습니다.',
    },
    // 게시글 상세 조회
    READ_DETAIL: {
      SUCCESS: '게시글 상세 조회에 성공하였습니다.',
    },
    // // 게시글 수정
    // UPDATE:{
    //   SUCCESS: '게시글 수정에 성공하였습니다.',
    // }
    // // 게시글 삭제
    // DELETE: {
    //   SUCCESS: '댓글 삭제에 성공하였습니다.',
    // },
  },
};
