import { API_BASE_URL } from '../../config/config.js';

// URL에서 게시글 ID를 가져와서 상세 내용 로드
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');
console.log('🚀 ~ postId:', postId);

async function fetchPost(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}`);
    if (!response.ok) throw new Error('게시글을 불러오는 데 실패했습니다.');
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

async function fetchComments(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`);
    if (!response.ok) throw new Error('댓글을 불러오는 데 실패했습니다.');
    const data = await response.json();
    if (data.status === 200) {
      return data.data;
    } else {
      console.error('댓글 목록을 불러오는 데 실패했습니다:', data.message);
      return [];
    }
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function renderPostDetail(postId) {
  const post = await fetchPost(postId);
  console.log('🚀 ~ renderPostDetail ~ post:', post);
  const comments = await fetchComments(postId);
  console.log('🚀 ~ renderPostDetail ~ comments:', comments);

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

  // 댓글 내용 렌더링
  const commentList = document.getElementById('comment-list');
  if (comments.length > 0) {
    comments.forEach((comment) => {
      const commentItem = document.createElement('li');
      commentItem.innerHTML = `
                <p>${comment.nickname} 
                | 작성일: ${new Date(comment.createdAt).toLocaleString()} 
                | 좋아요: ${comment.likes} 
                | 싫어요: ${comment.dislikes}
                </p>
                <p>${comment.content}</p>
            `;

      // 대댓글이 있는 경우 렌더링
      if (comment.recomments.length > 0) {
        const recommentsList = document.createElement('ul');
        recommentsList.style.listStyleType = 'none'; // 기본 리스트 스타일 제거
        recommentsList.style.paddingLeft = '20px'; // 들여쓰기

        comment.recomments.forEach((recomment) => {
          const recommentItem = document.createElement('li');
          recommentItem.innerHTML = `
                        <p>${recomment.nickname} 
                        | 작성일: ${new Date(recomment.createdAt).toLocaleString()} 
                        | 좋아요: ${recomment.likes} 
                        | 싫어요: ${recomment.dislikes}</p>
                        <p>${recomment.content}</p>
                    `;
          recommentsList.appendChild(recommentItem);
        });

        commentItem.appendChild(recommentsList);
      }

      commentList.appendChild(commentItem);
    });
  } else {
    commentList.innerHTML = '<p>댓글이 없습니다.</p>';
  }
}

// 페이지 로드 시 게시글과 댓글을 렌더링

if (postId) {
  renderPostDetail(postId);
}
// // 게시글 상세 정보를 로드하는 함수
// async function loadPostDetail(postId) {
//   try {
//     const response = await fetch(`${API_BASE_URL}/posts/${postId}`); // API 호출
//     const result = await response.json();

//     if (result.statusCode === 200) {
//       const post = result.data;
//       document.getElementById('post-category').textContent = post.category;
//       document.getElementById('post-nickname').textContent = post.nickname;
//       document.getElementById('post-date').textContent = new Date(
//         post.createdAt
//       ).toLocaleString();
//       document.getElementById('post-title').textContent = post.title;
//       document.getElementById('post-image').src = post.imageURL; // 게시글 이미지 URL
//       document.getElementById('post-content').textContent = post.content;

//       // 댓글 렌더링
//       const commentList = document.getElementById('comment-list');
//       commentList.innerHTML = '';
//       post.comments.forEach((comment) => {
//         const li = document.createElement('li');
//         li.textContent = `${comment.nickname} (${new Date(comment.createdAt).toLocaleString()}): ${comment.content}`;
//         commentList.appendChild(li);
//       });
//     } else {
//       console.error('게시글 상세 조회 실패:', result.message);
//     }
//   } catch (error) {
//     console.error('API 호출 중 오류 발생:', error);
//   }
// }

// 페이지 로드 시 게시글과 댓글을 렌더링
// renderPostDetail();
