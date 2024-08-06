import { API_BASE_URL } from '../../config/config.js';

// 게시글 작성 함수
async function createPost() {
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const content = editor.getMarkdown();

  const accessToken = localStorage.getItem('accessToken');

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
    // 이미지 업로드를 위한 후처리
    // uploadImages(postId, content);
  } else {
    alert('게시글 생성 실패');
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
    callback(result.data, 'image alt attribute');
  } catch (error) {
    console.error('업로드 실패 : ', error);
  }
}

// 게시글 작성 버튼 클릭 이벤트 리스너
document.getElementById('post-submit').addEventListener('click', createPost);
