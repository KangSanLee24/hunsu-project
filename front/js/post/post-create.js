// 페이지 로드 시 실행될 초기화 함수
function initializeForm() {
  const categoryElement = document.getElementById('post-category');
  const hashtagsElement = document.getElementById('post-hashtags');

  // 카테고리 변경 시 해시태그 입력란의 표시/숨김 상태를 제어하는 함수
  function updateHashtagsVisibility() {
    if (categoryElement.value === 'CHAT') {
      hashtagsElement.style.display = 'none';
    } else {
      hashtagsElement.style.display = 'block';
    }
  }

  // 초기 상태 설정
  updateHashtagsVisibility();

  // 카테고리 변경 이벤트 리스너 추가
  categoryElement.addEventListener('change', updateHashtagsVisibility);
}

// 페이지 로드 시 초기화 함수 호출
document.addEventListener('DOMContentLoaded', initializeForm);

// 전역변수 선언
const accessToken = localStorage.getItem('accessToken');

let postId = new URLSearchParams(window.location.search).get('id'); // URL에서 postId 가져오기

// 게시글 작성 함수
async function createPost() {
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const hashtags = document.getElementById('post-hashtags').value;
  const content = editor.getMarkdown();

  // 해시태그 유효성 검사 : 기본적으로 true
  let isValidHashtags = true;
  // 만약 카테고리가 CHAT이 아닌 경우 hashtags를 유효성 검사
  if (category !== 'CHAT') {
    isValidHashtags = validateHashtags(hashtags);
    if (!isValidHashtags) {
      alert('해시태그를 양식에 맞게 입력해주세요. (예: #해시태그 #5ZIRAP)');
      return;
    }
  }

  // 게시글 생성 API 호출
  const postResponse = await fetch(`/api/posts`, {
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
      hashtagsString: hashtags,
    }),
  });

  // 생성 성공
  if (postResponse.status === 201) {
    const postData = await postResponse.json();
    const postId = postData.data.id; // 생성된 게시글 ID를 저장

    // 해당 게시글 상세 페이지로 이동
    window.location.href = `./post-detail?id=${postId}`;
  } else {
    // 생성 실패
    alert('게시글 생성 실패');
  }
}

// 게시글 수정 함수
async function updatePost() {
  const title = document.getElementById('post-title').value;
  const category = document.getElementById('post-category').value;
  const hashtags = document.getElementById('post-hashtags').value;
  const content = editor.getMarkdown();

  // 해시태그 유효성 검사 : 기본적으로 true
  let isValidHashtags = true;
  // 만약 카테고리가 CHAT이 아닌 경우 hashtags를 유효성 검사
  if (category !== 'CHAT') {
    isValidHashtags = validateHashtags(hashtags);
    if (!isValidHashtags) {
      alert('해시태그를 양식에 맞게 입력해주세요. (예: #해시태그 #5ZIRAP)');
      return;
    }
  }

  // 게시글 수정 API 호출
  const postResponse = await fetch(`/api/posts/${postId}`, {
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
      hashtagsString: hashtags,
    }),
  });

  // 수정 성송
  if (postResponse.ok) {
    alert('게시글이 수정되었습니다.');
    // 수정된 게시글 상세 페이지로 이동
    window.location.href = `./post-detail?id=${postId}`;
  } else {
    // 수정 실패
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

// 해시태그 유효성 검사 체크하는 함수
function validateHashtags(hashtags) {
  // 해시태그가 비어있으면 true 반환
  if (!hashtags.trim()) {
    return true;
  }

  const hashtagPattern = /#\S+/g; // 해시태그 정규 표현식
  const hashtagItem = hashtags.match(hashtagPattern); // 해시태그와 매칭

  // 유효한 해시태그가 한 개도 없을 경우
  if (!hashtagItem || hashtagItem.length === 0) {
    return false;
  }

  //모든 해시태그가 #으로 시작하고 공백이 없는지 체크
  for (const tag of hashtagItem) {
    if (tag.trim().length < 2) {
      // #포함 최소 2글자 이상이어야 함
      return false;
    }
  }

  return true; // 모든 해시태그가 유효할 경우
}

// 게시글 작성 버튼 클릭 이벤트 리스너
document.getElementById('post-submit').addEventListener('click', () => {
  if (postId) {
    updatePost(); // postId가 존재하면 수정
  } else {
    createPost(); // 존재하지 않으면 생성
  }
});
