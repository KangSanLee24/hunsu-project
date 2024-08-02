import { API_BASE_URL } from '../../config/config.js';

// URL에서 게시글 ID를 가져와서 상세 내용 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 게시글 상세 조회 API 호출
async function fetchPost(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// 페이지 렌더링 메소드
async function renderPostDetail(postId) {
  const post = await fetchPost(postId);

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
    document.getElementById('post-image').src = post.data.imageUrl || ''; // 이미지 URL이 있는 경우
    document.getElementById('post-content').innerText =
      post.data.content || '내용 없음';
  }
}

// 페이지 로드 시 게시글과 댓글을 렌더링
if (postId) {
  renderPostDetail(postId);
}
