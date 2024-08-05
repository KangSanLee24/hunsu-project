import { API_BASE_URL } from '../../config/config.js';

// URL에서 게시글 ID를 가져와서 상세 내용 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

const submitLikeButton = document.getElementById('like-btn');
const submitDislikeButton = document.getElementById('dislike-btn');
// const imageContainer = document.getElementById('image-container'); // 이미지를 표시할 컨테이너

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
  console.log(post.data.images);
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
    document.getElementById('post-image').src = post.data.imageUrl || ''; // 이미지 URL이 있는 경우
    // marked 라이브러리로 마크다운 형식으로 표시
    document.getElementById('post-content').innerHTML =
      marked.parse(post.data.content) || '내용 없음';
  }
  console.log('🚀 ~ renderPostDetail ~ post.data.content:', post.data.content);
  // // 이미지 렌더링
  // if (post.data.images && post.data.images.length > 0) {
  //   post.data.images.forEach((image) => {
  //     const imgElement = document.createElement('img');
  //     imgElement.src = image; // 이미지 URL
  //     imgElement.alt = '게시글 이미지';
  //     imgElement.classList.add('post-image'); // 필요에 따라 클래스 추가
  //     imageContainer.appendChild(imgElement);
  //   });
  // }
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

// 좋아요 버튼 클릭 핸들러
async function handleLike() {
  await updateLikes(postId);
  await renderPostDetail(postId);
  submitLikeButton.classList.add('liked');
}

// 싫어요 버튼 클릭 핸들러
async function handleDislike() {
  await updateDislikes(postId);
  await renderPostDetail(postId);
  submitDislikeButton.classList.add('disliked');
}

// 버튼 클릭 이벤트 리스너 추가
submitLikeButton.addEventListener('click', handleLike);
submitDislikeButton.addEventListener('click', handleDislike);

// 페이지 로드 시 게시글과 댓글을 렌더링
if (postId) {
  renderPostDetail(postId);
}
