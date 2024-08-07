import { API_BASE_URL } from '../../config/config.js';

// 전역변수 선언

const accessToken = localStorage.getItem('accessToken');

let postId = new URLSearchParams(window.location.search).get('id'); // URL에서 postId 가져오기

// 게시글 작성 함수
async function createPost() {
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const content = editor.getMarkdown();

  // const accessToken = localStorage.getItem('accessToken');

  const postResponse = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: title,
      content: content,
      category: category,
      urlsArray: window.imageUrls, // 이미지 URL 배열 추가
    }),
  });

  if (postResponse.status === 201) {
    const postData = await postResponse.json();
    const postId = postData.data.id; // 생성된 게시글 ID를 저장

    // 해당 게시글 상세 페이지로 이동
    window.location.href = `./post-detail.html?id=${postId}`;
  } else {
    alert('게시글 생성 실패');
  }
}

// 게시글 수정 함수
async function updatePost() {
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const content = editor.getMarkdown();

  const postResponse = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      title: title,
      content: content,
      category: category,
      urlsArray: window.imageUrls, // 이미지 URL 배열 추가
    }),
  });

  if (postResponse.ok) {
    alert('게시글이 수정되었습니다.');
    // 수정된 게시글 상세 페이지로 이동
    window.location.href = `./post-detail.html?id=${postId}`;
  } else {
    alert('게시글 수정 실패');
  }
}

// 이미지 업로드 후 URL 저장
export async function addImageBlobHook(blob, callback) {
  try {
    const formData = new FormData();
    formData.append('files', blob);

    const response = await fetch(`/api/posts/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    });

    const result = await response.json();
    // URL을 배열에 추가
    imageUrls.push(result.data); // 업로드된 이미지 URL 저장
    callback(result.data, 'image');
  } catch (error) {
    console.error('업로드 실패 : ', error);
  }
}

// 게시글 작성 버튼 클릭 이벤트 리스너
document.getElementById('post-submit').addEventListener('click', () => {
  if (postId) {
    updatePost(); // postId가 존재하면 수정
  } else {
    createPost(); // 존재하지 않으면 생성
  }
});
