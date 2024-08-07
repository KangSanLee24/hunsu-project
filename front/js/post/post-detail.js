import { API_BASE_URL } from '../../config/config.js';

// URL에서 게시글 ID를 가져와서 상세 내용 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const postUpdateButton = document.getElementById('post-update-btn');
const postDeleteButton = document.getElementById('post-delete-btn');

const submitLikeButton = document.getElementById('like-btn');
const submitDislikeButton = document.getElementById('dislike-btn');

const accessToken = localStorage.getItem('accessToken');

/** accessToken으로 내 정보 조회 API */
async function fetchAccessToken(accessToken) {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// 게시글 상세 조회 API 호출
async function fetchPost() {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 게시글 삭제 API 호출
async function deletePost() {
  const confirmDelete = confirm('게시글을 삭제하시겠습니까?');
  if (confirmDelete) {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      alert('게시글이 삭제되었습니다.');
      window.location.href = './post-list.html';
    } else {
      alert('게시글 삭제 실패');
    }
  }
}

// 페이지 렌더링 메소드
async function renderPostDetail(postId) {
  const post = await fetchPost(postId);
  marked.use({
    headerIds: false,
    mangle: false,
  });

  // 게시글 내용 렌더링
  if (post) {
    document.getElementById('post-category').innerText =
      post.data.category || 'N/A';
    document.getElementById('post-nickname').innerText =
      post.data.nickname || '익명';
    document.getElementById('post-date').innerText =
      new Date(post.data.createdAt).toLocaleString() || 'N/A';
    document.getElementById('post-likes').innerText = post.data.numLikes || '0';
    document.getElementById('post-dislikes').innerText =
      post.data.numDislikes || '0';
    document.getElementById('post-title').innerText =
      post.data.title || '제목 없음';
    // marked 라이브러리로 마크다운 형식으로 표시
    document.getElementById('post-content').innerHTML =
      marked.parse(post.data.content) || '내용 없음';

    try {
      // accessToken으로 사용자 정보 체크
      const result = await fetchAccessToken(accessToken);
      if (result.status === 200 && result.data.id == post.data.userId) {
        document.getElementById('post-update-btn').disabled = false;
        document.getElementById('post-delete-btn').disabled = false;
        console.log('여기까지왔으면 바뀌어야됨');
      }
    } catch (error) {}
  }
}

// 좋아요 API 호출
async function updateLikes(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('좋아요 업데이트에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 싫어요 API 호출
async function updateDislikes(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislikes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('싫어요 업데이트에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}
// 좋아요 취소 API 호출
async function cancelLikes(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/likes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('좋아요 취소에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 싫어요 취소 API 호출
async function cancelDislikes(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/dislikes`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    if (!response.ok) throw new Error('싫어요 취소에 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 좋아요 버튼 클릭 핸들러
async function handleLike() {
  // 버튼이 이미 눌린 상태라면 좋아요를 취소합니다.
  if (submitLikeButton.classList.contains('liked')) {
    await cancelLikes(postId);
    submitLikeButton.classList.remove('liked');
    submitLikeButton.innerHTML = '👍 좋아요'; // 좋아요 취소 시 이모지 변경
    submitDislikeButton.disabled = false; // 싫어요 버튼 활성화
  } else {
    await updateLikes(postId);
    submitLikeButton.classList.add('liked');
    submitLikeButton.innerHTML = '❤️ 좋아요'; // 좋아요 추가 시 이모지 변경
    submitDislikeButton.disabled = true; // 싫어요 버튼 활성화
  }
  await renderPostDetail(postId);
}

// 싫어요 버튼 클릭 핸들러
async function handleDislike() {
  // 버튼이 이미 눌린 상태라면 싫어요를 취소합니다.
  if (submitDislikeButton.classList.contains('disliked')) {
    await cancelDislikes(postId);
    submitDislikeButton.classList.remove('disliked');
    submitDislikeButton.innerHTML = '👎 싫어요'; // 싫어요 취소 시 이모지와 텍스트
    submitLikeButton.disabled = false; // 좋아요 버튼 활성화
  } else {
    await updateDislikes(postId);
    submitDislikeButton.classList.add('disliked');
    submitDislikeButton.innerHTML = '💔 싫어요!'; // 싫어요 추가 시 이모지와 텍스트
    submitLikeButton.disabled = true; // 좋아요 버튼 비활성화
  }
  await renderPostDetail(postId);
}

// 버튼 클릭 이벤트 리스너 추가
submitLikeButton.addEventListener('click', handleLike);
submitDislikeButton.addEventListener('click', handleDislike);
postUpdateButton.addEventListener('click', () => {
  window.location.href = `post-create.html?id=${postId}`;
});
postDeleteButton.addEventListener('click', deletePost);

// 페이지 로드 시 게시글과 댓글을 렌더링
if (postId) {
  renderPostDetail(postId);
}
