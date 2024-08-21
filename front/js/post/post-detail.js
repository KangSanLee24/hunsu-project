import { identifyUser } from '../common/identify-user.js';

/** 게시글 상세 페이지에 필요한 변수 선언 **/
// 1. URL에서 게시글 ID를 가져와서 상세 내용 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// 2. 버튼 선언
const postUpdateButton = document.getElementById('post-update-btn');
const postDeleteButton = document.getElementById('post-delete-btn');

const submitLikeButton = document.getElementById('like-btn');
const submitDislikeButton = document.getElementById('dislike-btn');

// 3. 로그인 관련
const accessToken = localStorage.getItem('accessToken');
const user = accessToken ? await identifyUser(accessToken) : null;

/** 게시글 상세 페이지 랜더링 **/
async function renderPostDetail(postId) {
  const post = await fetchPost(postId);
  marked.setOptions({
    headerIds: false,
    mangle: false,
    breaks: true, // 줄바꿈을 <br>로 변환하도록 설정
  });

  // 1. 게시글 내용 랜더링
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
    //해시태그 렌더링
    const hashtagsContainer = document.getElementById('post-hashtags');
    const hashtagsString = post.data.hashtagsString;
    if (hashtagsString && hashtagsString.length > 0) {
      hashtagsContainer.innerHTML = hashtagsString
        .map((tag) => `<span class="hashtag">${tag}</span>`)
        .join(' ');
    } else {
      hashtagsContainer.style.display = 'none'; // 해시태그가 없을 때는 숨기기
    }

    try {
      if (!accessToken) {
        document.getElementById('post-update-btn').disabled = true;
        document.getElementById('post-delete-btn').disabled = true;
      } else {
        // accessToken으로 사용자 정보 체크
        if (user.status === 200 && user.data.id == post.data.userId) {
          document.getElementById('post-update-btn').disabled = false;
          document.getElementById('post-delete-btn').disabled = false;
        } else {
          document.getElementById('post-update-btn').disabled = true;
          document.getElementById('post-delete-btn').disabled = true;
        }
      }
    } catch (error) {}
  }
}

/** 게시글 상세 조회 API 호출 **/
async function fetchPost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

/** 나의 게시글 좋아요/싫어요 여부 조회 **/
async function fetchLD(postId) {
  try {
    // 1. 게시글 좋아요 눌렀는지 조회
    const postLike = await fetch(`/api/posts/${postId}/likes/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    const resultPostLike = await postLike.json();
    // 1-1. 눌렀다면
    if (resultPostLike.data == true) {
      submitLikeButton.classList.add('liked');
      submitLikeButton.innerHTML = '❤️ 좋아요!';
      submitDislikeButton.disabled = true;
    }

    // 2. 게시글 싫어요 눌렀는지 조회
    const postDislike = await fetch(`/api/posts/${postId}/dislikes/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    const resultPostDislike = await postDislike.json();
    // 2-1. 눌렀다면
    if (resultPostDislike.data == true) {
      submitDislikeButton.classList.add('disliked');
      submitDislikeButton.innerHTML = '💔 싫어요!';
      submitLikeButton.disabled = true;
    }
  } catch (error) {
    console.error('나의 게시글 좋아요/싫어요 여부 조회 API 실행 중 오류 발생');
  }
}

/** 게시글 좋아요 클릭 **/
async function clickLikes(postId) {
  if (user) {
    try {
      // 1. 게시글 좋아요 클릭 API 호출
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // 2. fetch 받아온 result를 json으로
      const result = await response.json();
      // 3. API response 결과가 ok가 아니면
      if (!response.ok) {
        alert(result.message);
        return false;
      }
      return true;
    } catch (error) {
      // 4. 도중에 에러가 뜬 경우
      alert('게시글 좋아요에서 오류가 발생했습니다.');
      console.error(error);
      return false;
    }
  } else {
    alert('로그인한 상태에서만 좋아요를 누를 수 있습니다.');
  }
}

/** 게시글 싫어요 클릭 **/
async function clickDislikes(postId) {
  if (user) {
    try {
      // 1. 게시글 싫어요 클릭 API 호출
      const response = await fetch(`/api/posts/${postId}/dislikes`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // 2. fetch 받아온 result를 json으로
      const result = await response.json();
      // 3. API response 결과가 ok가 아니면
      if (!response.ok) {
        alert(result.message);
        return false;
      }
      return true;
    } catch (error) {
      // 4. 도중에 에러가 뜬 경우
      alert('게시글 싫어요에서 오류가 발생했습니다.');
      console.error(error);
      return false;
    }
  } else {
    alert('로그인한 상태에서만 싫어요를 누를 수 있습니다.');
  }
}

// 게시글 삭제 API 호출
async function deletePost() {
  const confirmDelete = confirm('게시글을 삭제하시겠습니까?');
  if (confirmDelete) {
    const response = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      alert('게시글이 삭제되었습니다.');
      window.location.href = './post-list';
    } else {
      alert('게시글 삭제 실패');
    }
  }
}

// 좋아요 버튼 클릭 핸들러
async function handleLike() {
  if (user) {
    // 버튼이 이미 눌린 상태라면 좋아요를 취소합니다.
    if (submitLikeButton.classList.contains('liked')) {
      const clicked = await clickLikes(postId);

      if (clicked !== false) {
        submitLikeButton.classList.remove('liked');
        submitLikeButton.innerHTML = '👍 좋아요'; // 좋아요 취소 시 이모지 변경
        submitDislikeButton.disabled = false; // 싫어요 버튼 활성화
      }
    } else {
      const clicked = await clickLikes(postId);
      if (clicked !== false) {
        submitLikeButton.classList.add('liked');
        submitLikeButton.innerHTML = '❤️ 좋아요!'; // 좋아요 추가 시 이모지 변경
        submitDislikeButton.disabled = true; // 싫어요 버튼 활성화
      }
    }
    await renderPostDetail(postId);
  } else {
    alert('로그인한 상태에서만 좋아요를 누를 수 있습니다.');
  }
}

// 싫어요 버튼 클릭 핸들러
async function handleDislike() {
  if (user) {
    // 버튼이 이미 눌린 상태라면 싫어요를 취소합니다.
    if (submitDislikeButton.classList.contains('disliked')) {
      const clicked = await clickDislikes(postId);
      if (clicked !== false) {
        submitDislikeButton.classList.remove('disliked');
        submitDislikeButton.innerHTML = '👎 싫어요'; // 싫어요 취소 시 이모지와 텍스트
        submitLikeButton.disabled = false; // 좋아요 버튼 활성화
      }
    } else {
      const clicked = await clickDislikes(postId);
      if (clicked !== false) {
        submitDislikeButton.classList.add('disliked');
        submitDislikeButton.innerHTML = '💔 싫어요!'; // 싫어요 추가 시 이모지와 텍스트
        submitLikeButton.disabled = true; // 좋아요 버튼 비활성화
      }
    }
    await renderPostDetail(postId);
  } else {
    alert('로그인한 상태에서만 싫어요를 누를 수 있습니다.');
  }
}

// 버튼 클릭 이벤트 리스너 추가
submitLikeButton.addEventListener('click', handleLike);
submitDislikeButton.addEventListener('click', handleDislike);
postUpdateButton.addEventListener('click', () => {
  window.location.href = `post-create?id=${postId}`;
});
postDeleteButton.addEventListener('click', deletePost);

/** 페이지 시작!! 페이지 로드 시 게시글 fetch 및 render **/
if (postId) {
  renderPostDetail(postId);
  if (user) {
    fetchLD(postId);
  }
}
