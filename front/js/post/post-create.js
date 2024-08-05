import { API_BASE_URL } from '../../config/config.js';

// 전역 변수로 이미지 저장 배열 정의
window.imageBlobs = [];
window.imageUrls = [];

// content에서 `![이미지이름](ㅁㄴㅇㄹ)`

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
    }),
  });

  if (postResponse.status === 201) {
    const postData = await postResponse.json();
    const postId = postData.data.id; // 생성된 게시글 ID를 저장

    // 이미지 업로드를 위한 후처리
    uploadImages(postId, content);
  } else {
    alert('게시글 생성 실패');
  }
}

// 이미지 업로드 함수
async function uploadImages(postId, content) {
  const formData = new FormData();

  imageBlobs.forEach((blob) => {
    formData.append('files', blob); // 배열의 모든 Blob 추가
  });

  try {
    const imageResponse = await fetch(
      `${API_BASE_URL}/posts/${postId}/images`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      }
    );

    const imageData = await imageResponse.json();

    if (imageData.statusCode === 200) {
      // 이미지 URL을 콘텐츠에 삽입
      const imageUrls = imageData.data;
      let finalContent = content;

      imageUrls.forEach((url, index) => {
        // Base64 이미지를 S3 URL로 대체
        const regex = new RegExp(
          `!\\[image${index + 1}\\]\\(data:image\\/[^;]+;base64[^)]+\\)`,
          'g'
        );
        finalContent = finalContent.replace(
          regex,
          `![image${index + 1}](${url})`
        );
      });

      // 게시글 업데이트
      await updatePostContent(postId, finalContent);
      alert('게시글과 이미지 업로드 성공');
    } else {
      alert('이미지 업로드 실패');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('이미지 업로드 중 오류가 발생했습니다.');
  }
}

// 게시글 업데이트 함수
async function updatePostContent(postId, content) {
  const accessToken = localStorage.getItem('accessToken');

  const updateResponse = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content: content }),
  });

  if (!updateResponse.ok) {
    alert('게시글 업데이트 실패');
  }
}

// 게시글 작성 버튼 클릭 이벤트 리스너
document.getElementById('post-submit').addEventListener('click', createPost);
