import { API_BASE_URL } from '../../config/config.js';
import { elapsedTime } from '../common/elapsed-time.js';

const submitCommentButton = document.getElementById('submit-comment');
const commentContentInput = document.getElementById('comment-content');
const commentList = document.getElementById('comment-list');

// URL에서 게시글 ID를 가져옴
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 댓글 작성 함수
async function createComment(content) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ content }),
    });

    const result = await response.json();

    if (response.status === 201) {
      addCommentToList(result.data);
      commentContentInput.value = ''; // 입력란 초기화
      // 페이지 새로고침
      window.location.reload();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('댓글 작성 중 오류 발생:', error);
  }
}

// 댓글 좋아요 API 호출 함수
async function likeComment(commentId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/likes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );

    if (!response.ok) throw new Error('댓글 좋아요에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert('댓글 좋아요에 오류가 발생했습니다.');
  }
}

// 댓글 싫어요 API 호출 함수
async function dislikeComment(commentId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/dislikes`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    if (!response.ok) throw new Error('댓글 싫어요에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert('댓글 싫어요에 오류가 발생했습니다.');
  }
}

// 댓글 리스트에 추가하는 함수
function addCommentToList(comment) {
  const commentItem = document.createElement('li');
  commentItem.innerHTML = `
                <p>${comment.nickname} 
                | 작성일: ${elapsedTime(comment.createdAt)} 
                | 좋아요: ${comment.likes || 0} 
                | 싫어요: ${comment.dislikes || 0}
                </p>
                <p>${comment.content}</p>
                <button class="recomment-btn" data-comment-id="${comment.id}">대댓글 작성</button>
                <div class="recomment-input" style="display: none;">
                  <textarea placeholder="대댓글을 입력하세요..." rows="2"></textarea>
                  <button class="submit-recomment">작성</button>
                </div>
                <button class="comment-like-btn" data-comment-id="${comment.id}">좋아요</button>
                <button class="comment-dislike-btn" data-comment-id="${comment.id}">싫어요</button>
            `;

  // 대댓글이 있는 경우 렌더링
  if (comment.recomments && comment.recomments.length > 0) {
    const recommentsList = document.createElement('ul');
    recommentsList.style.listStyleType = 'none'; // 기본 리스트 스타일 제거
    recommentsList.style.paddingLeft = '20px'; // 들여쓰기

    comment.recomments.forEach((recomment) => {
      const recommentItem = document.createElement('li');
      recommentItem.innerHTML = `
                      <p>${recomment.nickname}
                      | 작성일: ${elapsedTime(recomment.createdAt)}
                      | 좋아요: ${recomment.likes}
                      | 싫어요: ${recomment.dislikes}</p>
                      <p>${recomment.content}</p>
                  `;
      recommentsList.appendChild(recommentItem);
    });

    commentItem.appendChild(recommentsList);
  }

  commentList.appendChild(commentItem);
}

// 댓글을 불러오는 함수
async function fetchComments() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) throw new Error('댓글을 불러오는 데 실패했습니다.');

    const result = await response.json();
    renderComments(result.data);
  } catch (error) {
    console.error(error);
    alert('댓글을 불러오는 중 오류가 발생했습니다.');
  }
}

// 댓글 좋아요 버튼 클릭 이벤트 핸들러
async function handleLikeButtonClick(event) {
  const commentId = event.target.dataset.commentId;
  await likeComment(commentId);
  window.location.reload(); // 댓글 목록 새로고침
}

// 댓글 싫어요 버튼 클릭 이벤트 핸들러
async function handleDislikeButtonClick(event) {
  const commentId = event.target.dataset.commentId;
  await dislikeComment(commentId);
  window.location.reload(); // 댓글 목록 새로고침
}

// 댓글 리스트에 좋아요 및 싫어요 버튼 클릭 이벤트 리스너
commentList.addEventListener('click', async (event) => {
  if (event.target.classList.contains('comment-like-btn')) {
    await handleLikeButtonClick(event);
  } else if (event.target.classList.contains('comment-dislike-btn')) {
    await handleDislikeButtonClick(event);
  }
});

// 댓글 렌더링 함수
function renderComments(comments) {
  commentList.innerHTML = ''; // 기존 댓글 초기화
  if (comments.length > 0) {
    comments.forEach((comment) => {
      addCommentToList(comment);
    });
  } else {
    commentList.innerHTML = '<p>댓글이 없습니다.</p>';
  }
}

// 대댓글 작성 API 호출 함수
async function submitRecomment(commentId, content) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/comments/${commentId}/recomments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ content }),
      }
    );
    if (!response.ok) throw new Error('대댓글 작성에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 댓글 작성 버튼 클릭 이벤트 리스너
submitCommentButton.addEventListener('click', () => {
  const content = commentContentInput.value.trim();
  if (content) {
    createComment(content);
  } else {
    alert('댓글 내용을 입력하세요.');
  }
});

// 대댓글 버튼 클릭 시 대댓글 입력 UI 토글
commentList.addEventListener('click', (event) => {
  if (event.target.classList.contains('recomment-btn')) {
    const recommentInput = event.target.nextElementSibling;
    recommentInput.style.display =
      recommentInput.style.display === 'none' ? 'block' : 'none';
  }
});

// 대댓글 작성 버튼 클릭 시 API 호출
commentList.addEventListener('click', async (event) => {
  if (event.target.classList.contains('submit-recomment')) {
    const recommentInput = event.target.closest('.recomment-input');
    const recommentContent = recommentInput.querySelector('textarea').value;
    const commentId = event.target.closest('li').querySelector('.recomment-btn')
      .dataset.commentId;

    if (recommentContent) {
      await submitRecomment(commentId, recommentContent);
      recommentInput.style.display = 'none'; // 입력 후 숨김
      window.location.reload();
    } else {
      alert('대댓글 내용을 입력하세요.');
    }
  }
});

// 페이지 로드 시 게시글과 댓글을 렌더링
if (postId) {
  fetchComments(); // 댓글 불러오는 함수 호출
}