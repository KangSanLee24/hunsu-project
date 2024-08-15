import { API_BASE_URL } from '../../config/config.js';
import { elapsedTime } from '../common/elapsed-time.js';

/** 0. 댓글 목록 조회에 필요한 변수 선언 **/
// 0-1. URL에서 게시글 ID를 가져와서 댓글 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 0-2. 기타 선언
const submitCommentButton = document.getElementById('submit-comment');
const commentContentInput = document.getElementById('comment-content');
const commentList = document.getElementById('comment-list');

/** 1. 댓글 목록 조회 API **/
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

/** 2. 댓글 랜더링 함수 **/
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

/** 3. 댓글 리스트에 추가하는 함수 **/
async function addCommentToList(comment) {
  const commentItem = document.createElement('li');
  commentItem.innerHTML = `
    <div class="comment-header">
      <span>${comment.nickname} | 작성일: ${elapsedTime(comment.createdAt)} | </span>
      <div class="comment-like-btn-count">
        <button class="comment-like-btn" data-comment-id="${comment.id}" onclick="clickLikeComment(${comment.id})">👍</button>
        <span class="comment-like-count"> ${comment.likes || 0} </span>
      </div>
      <div class="comment-dislike-btn-count">
        <button class="comment-dislike-btn" data-comment-id="${comment.id}" onclick="clickDislikeComment(${comment.id})">👎</button>
        <span class="comment-dislike-count"> ${comment.dislikes || 0} </span>
      </div>
      <div>
        <button class="edit-comment-btn" onclick="editComment(${comment.id}, '${comment.content}')">수정</button>
        <button class="delete-comment-btn" onclick="deleteComment(${comment.id})">삭제</button>
      </div>       
    </div>
    <p>${comment.content}</p>
    <button class="recomment-btn" data-comment-id="${comment.id}" onclick="fetchRecomments(${comment.id})">대댓글 (${comment.recommentsCount})</button>
    <div class="recomment-list" id="recomment-list-${comment.id}" style="display: none;"></div>  
  `;

  commentList.appendChild(commentItem);
}

/** 4. 대댓글을 불러오는 함수 **/
async function fetchRecomments(commentId) {
  const recommentList = document.getElementById(`recomment-list-${commentId}`);
  if (recommentList.style.display === 'block') {
    recommentList.style.display = 'none'; // 이미 보이는 경우 숨김
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/comments/${commentId}/recomments`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) throw new Error('대댓글을 불러오는 데 실패했습니다.');

    const result = await response.json();
    renderRecomments(commentId, result.data, recommentList);
    recommentList.style.display = 'block'; // 대댓글 목록 보이기
  } catch (error) {
    console.error(error);
    alert('대댓글을 불러오는 중 오류가 발생했습니다.');
  }
}

/** 5. 대댓글 랜더링 함수 **/
function renderRecomments(commentId, recomments, recommentList) {
  recommentList.innerHTML = ''; // 기존 대댓글 초기화
  recommentList.style.paddingLeft = '20px'; // 들여쓰기
  if (recomments.length > 0) {
    recomments.forEach((recomment) => {
      const recommentItem = document.createElement('li');
      recommentItem.innerHTML = `
      <div class="comment-header">
        <span>${recomment.nickname} | 작성일: ${elapsedTime(recomment.createdAt)} </span> 
        <div class="comment-like-btn-count">
          <button class="comment-dislike-btn" data-comment-id="${recomment.id}" onclick="clickLikeComment(${recomment.id})">👍</button>
          <span class="recomment-like-count">${recomment.likes || 0}</span>
        </div>
        <div class="comment-dislike-btn-count">
          <button class="comment-dislike-btn" data-comment-id="${recomment.id}" onclick="clickDislikeComment(${recomment.id})">👎</button>
          <span class="recomment-dislike-count">${recomment.dislikes || 0}</span>
        </div>
      </div>
      <p>${recomment.content}</p>
      `;
      recommentList.appendChild(recommentItem);
    });
  } else {
    recommentList.innerHTML = '<p>대댓글이 없습니다.</p>';
  }

  // 대댓글 작성 버튼과 입력 공간 추가
  const recommentInputContainer = document.createElement('div');
  recommentInputContainer.innerHTML = `
    <button class="recomment-btn" onclick="toggleRecommentInput(${commentId})">대댓글 작성</button>
    <div class="recomment-input" id="recomment-input-${commentId}" style="display: none;">
      <textarea placeholder="대댓글을 입력하세요..." rows="2"></textarea>
      <button class="submit-recomment" onclick="addRecomment(${commentId})">작성</button>
    </div>
  `;
recommentList.appendChild(recommentInputContainer);
}


/** 4. 나의 댓글 좋아요/싫어요 여부 조회 **/
async function fetchLD(commentId) {
  try {
    // 1. 댓글 좋아요 눌렀는지 조회
    const commentLike = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}/likes/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    const resultCLike = await commentLike.json();
    // 1-1. 눌렀다면
    if (resultCLike.data == true) {
      // 좋아요 핸들러 설정 해주기
    }

    // 2. 댓글 싫어요 눌렀는지 조회
    const commentDislike = await fetch(
      `${API_BASE_URL}/comments/${commentId}/dislikes/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    const resultCDislike = await commentDislike.json();
    // 1-1. 눌렀다면
    if (resultCDislike.data == true) {
      // 싫어요 핸들러 설정 해주기
    }
  } catch (error) {
    console.error('나의 댓글 좋아요/싫어요 여부 조회 API 실행 중 오류 발생');
  }
}

/** 0. 댓글 작성 **/
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

/** 0. 대댓글 작성 **/
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

/** 0. 댓글 좋아요 클릭 **/
async function clickLikeComment(commentId) {
  try {
    // 0-1. 댓글 좋아요 클릭 API 호출
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}/likes`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    // 0-2. fetch 받아온 result를 json으로
    const result = await response.json();
    // 0-3. API response 결과가 ok가 아니면
    if (!response.ok) {
      alert(result.message);
    }
    // 0-4. 댓글목록 새로 불러오기
    fetchComments();
  } catch (error) {
    // 0-5. 도중에 에러가 뜬 경우
    alert('댓글 좋아요에서 오류가 발생했습니다.');
    console.error(error);
  }
}

/** 0. 댓글 싫어요 클릭 **/
async function clickDislikeComment(commentId) {
  try {
    // 0-1. 댓글 싫어요 클릭 API 호출
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/comments/${commentId}/dislikes`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    // 0-2. fetch 받아온 result를 json으로
    const result = await response.json();
    // 0-3. API response 결과가 ok가 아니면
    if (!response.ok) {
      alert(result.message);
    }
    // 0-4. 댓글목록 새로 불러오기
    fetchComments();
  } catch (error) {
    // 0-5. 도중에 에러가 뜬 경우
    alert('댓글 싫어요에서 오류가 발생했습니다.');
    console.error(error);
  }
}

/** [댓글 작성] 및 [대댓글] 버튼 **/
// 1. [댓글 작성] 버튼 클릭 이벤트 리스너
submitCommentButton.addEventListener('click', () => {
  const content = commentContentInput.value.trim();
  if (content) {
    createComment(content);
  } else {
    alert('댓글 내용을 입력하세요.');
  }
});

// 2. [대댓글] 버튼 클릭 시 대댓글 입력 UI 토글
commentList.addEventListener('click', (event) => {
  if (event.target.classList.contains('recomment-btn')) {
    const recommentInput = event.target.nextElementSibling;

    // 대댓글 입력 UI가 있는지 확인
    if (recommentInput && recommentInput.classList.contains('recomment-input')) {
      recommentInput.style.display = 
        recommentInput.style.display === 'none' || recommentInput.style.display === '' ? 'block' : 'none';
    }
  }
});

// 3. [대댓글 작성] 버튼 클릭 시 API 호출
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

/** 페이지 시작!! 0. 페이지 로드 시 댓글 fetch 및 render **/
if (postId) {
  fetchComments(); // 댓글 불러오는 함수 호출
}

/** 전역변수 선언 **/
window.clickLikeComment = clickLikeComment;
window.clickDislikeComment = clickDislikeComment;
window.fetchRecomments = fetchRecomments;