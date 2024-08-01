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
            SUCCESS: '댓글 목록 조회에 성공하습니다.',
        },
        // 댓글 수정
        UPDATE: {
            SUCCESS: '댓글 수정에 성공하였습니다.',
            FAILURE: {
                FORBIDDEN: '해당 댓글을 수정할 권한이 없습니다.',
            }
        },
        // 댓글 삭제
        DELETE: {
            SUCCESS: '댓글 삭제에 성공하였습니다.',
            FAILURE: {
                FORBIDDEN: '해당 댓글을 삭제할 권한이 없습니다.',
            }
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
                SUCCESS: '이미지 업로드에 성공하습니다.',
            },
        },
    },
};
