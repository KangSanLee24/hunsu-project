/** 댓글 수정 활성화 함수 **/
export function enableEditComment(commentId, currentContent) {
  const commentItem = document.querySelector(
    `li[data-comment-id="${commentId}"]`
  );
  const inputField = commentItem.querySelector('.edit-comment-input');
  const commentContent = commentItem.querySelector('.comment-content');
  const editButton = commentItem.querySelector('.edit-comment-btn');

  inputField.style.display = 'block'; // 입력 필드 보이기
  inputField.focus(); // 입력 필드에 포커스
  commentContent.style.display = 'none'; // 기존 댓글 내용 숨기기
  editButton.innerText = '수정 완료'; // 버튼 텍스트 변경

  // 입력 필드에서 Enter 키를 누르면 수정 완료
  inputField.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      const newContent = inputField.value;
      await editComment(commentId, newContent);
      finalizeEdit(commentItem, newContent); // 수정 완료 처리
    }
  });

  // 수정 완료 버튼 클릭 시 처리
  editButton.addEventListener('click', async () => {
    const newContent = inputField.value;
    await editComment(commentId, newContent);
    finalizeEdit(commentItem, newContent); // 수정 완료 처리
  });
}

/** 댓글 수정 API **/
export async function editComment(commentId, content) {
  try {
    const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ content }),
    });

    if (response.status !== 200) {
      alert('댓글 수정에 실패하였습니다.');
    }
  } catch (error) {
    console.error('댓글 수정에 실패하였습니다.', error);
  }
}

// 수정 완료 처리 함수
function finalizeEdit(commentItem, newContent) {
  const inputField = commentItem.querySelector('.edit-comment-input');
  const commentContent = commentItem.querySelector('.comment-content');
  const editButton = commentItem.querySelector('.edit-comment-btn');

  inputField.style.display = 'none'; // 입력 필드 숨기기
  commentContent.innerText = newContent; // 댓글 내용 업데이트
  commentContent.style.display = 'block'; // 댓글 내용 다시 보이기
  editButton.innerText = '수정'; // 버튼 텍스트 원래대로 되돌리기
}

/** 댓글 삭제 함수 **/
async function deleteComment(commentId) {
  try {
    const confirmDelete = confirm('정말로 댓글을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (response.status === 200) {
      // 댓글 리스트에서 삭제
      removeCommentFromList(commentId);
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('댓글 삭제에 실패하였습니다.', error);
  }
}

/** 댓글 내용을 업데이트하는 함수 **/
function updateCommentInList(commentId, newContent) {
  const commentItem = document.querySelector(
    `li[data-comment-id="${commentId}"]`
  );
  if (commentItem) {
    commentItem.querySelector('p').innerText = newContent;
  }
}

/** 댓글 리스트에서 댓글을 삭제하는 함수 **/
function removeCommentFromList(commentId) {
  const commentItem = document.querySelector(
    `li[data-comment-id="${commentId}"]`
  );
  console.log('🚀 ~ removeCommentFromList ~ commentItem:', commentItem);
  if (commentItem) {
    commentItem.remove;
  }
}

/** 대댓글 수정 함수 **/

/** 대댓글 삭제 함수 **/
