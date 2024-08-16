// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', async () => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = './log-in';
    return;
  }

  try {
    // 포인트 정보 가져오기
    const response = await fetch(`/api/points/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      displayUserPoints(result.data);
    } else {
      alert('포인트 정보를 불러오는 데 실패했습니다.');
    }

    // 작성한 게시글 정보 가져오기
    const postResponse = await fetch(`/api/users/me/posts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (postResponse.ok) {
      const postResult = await postResponse.json();
      displayUserPosts(postResult.data);
    } else {
      alert('작성한 게시글 정보를 불러오는 데 실패했습니다.');
    }

    // 작성한 댓글 정보 가져오기
    const commentResponse = await fetch(`/api/users/me/comments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (commentResponse.ok) {
      const commentResult = await commentResponse.json();
      displayUserComments(commentResult.data);
    } else {
      alert('작성한 댓글 정보를 불러오는 데 실패했습니다.');
    }
  } catch (error) {
    console.error('Error fetching point data:', error);
    alert('포인트 정보를 불러오는 중 오류가 발생했습니다.');
  }
});

// 포인트 보기
function displayUserPoints(data) {
  if (!data) {
    console.error('displayUserPoints: 데이터가 정의되지 않았거나 null입니다.');
    return;
  }

  const profileNickname = document.getElementById('profileNickname');
  const totalPoints = document.getElementById('totalPoints');
  const level = document.getElementById('level');

  const attention = document.getElementById('attention');
  const post = document.getElementById('post');
  const postLike = document.getElementById('postLike');
  const comment = document.getElementById('comment');
  const commentLike = document.getElementById('commentLike');

  const userLevel = Math.floor(data.totalPoint / 100) + 1;

  if (profileNickname) {
    profileNickname.innerText = data.nickname || '닉네임';
  } else {
    console.error('profileNickname 요소를 찾을 수 없습니다.');
  }

  if (totalPoints) {
    totalPoints.innerText = `포인트: ${data.totalPoint}`;
  } else {
    console.error('totalPoints 요소를 찾을 수 없습니다.');
  }

  if (level) {
    level.innerText = `LV.${userLevel} 멤버`;
  } else {
    console.error('level 요소를 찾을 수 없습니다.');
  }

  if (attention) {
    attention.innerText = `${data.counts.attention}/${data.maxCounts.attention}`;
  } else {
    console.error('attention 요소를 찾을 수 없습니다.');
  }

  if (post) {
    post.innerText = `${data.counts.post}/${data.maxCounts.post}`;
  } else {
    console.error('post 요소를 찾을 수 없습니다.');
  }

  if (postLike) {
    postLike.innerText = `${data.counts.postLike}/${data.maxCounts.postLike}`;
  } else {
    console.error('postLike 요소를 찾을 수 없습니다.');
  }

  if (comment) {
    comment.innerText = `${data.counts.comment}/${data.maxCounts.comment}`;
  } else {
    console.error('comment 요소를 찾을 수 없습니다.');
  }

  if (commentLike) {
    commentLike.innerText = `${data.counts.commentLike}/${data.maxCounts.commentLike}`;
  } else {
    console.error('commentLike 요소를 찾을 수 없습니다.');
  }
}

// 작성한 게시글 표시
function displayUserPosts(posts) {
  const myPostsList = document.getElementById('myPostsList');
  myPostsList.innerHTML = '';

  if (posts.length === 0) {
    myPostsList.innerHTML = '<li>게시글이 없습니다.</li>';
    return;
  }

  posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
            <a href="/post-detail?id=${post.id}">
                <p>${post.title}</p>
                <p>${new Date(post.createdAt).toLocaleString()}</p>
            </a>
        `;
    myPostsList.appendChild(listItem);
  });
}

// 작성한 댓글 표시
function displayUserComments(comments) {
  const myCommentsList = document.getElementById('myCommentsList');
  myCommentsList.innerHTML = '';

  if (comments.length === 0) {
    myCommentsList.innerHTML = '<li>댓글이 없습니다.</li>';
    return;
  }

  comments.forEach((comment) => {
    const listItem = document.createElement('li');
    // <p>게시글: ${comment.postTitle}</p>
    listItem.innerHTML = `
            <a href="/post-detail?id=${comment.postId}">
                <p>${comment.content}</p>
                <p>${new Date(comment.createdAt).toLocaleString()}</p>
            </a>
        `;
    myCommentsList.appendChild(listItem);
  });
}

// 닉네임변경 버튼 함수
window.clickUpdateProfileBtn = async function () {
  let nickname = '';

  // 내 정보 조회 API
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      alert('현재 닉네임을 가져오는데 실패했습니다.');
      return;
    }

    // user로 저장
    const user = await response.json();
    // nickname 추출
    nickname = user.data.nickname;
  } catch (error) {
    console.error(error);
    return;
  }

  // localStorage에 nickname 저장
  localStorage.setItem('nickname', nickname);

  // 내 정보 수정으로 이동
  window.location.href = './update-profile';
};

// 회원 탈퇴 함수
window.clickDeleteProfileBtn = async function () {
  let email = '';
  let nickname = '';

  // 내 정보 조회 API
  try {
    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      alert('현재 이메일을 가져오는데 실패했습니다.');
      return;
    }

    // user로 저장
    const user = await response.json();
    // nickname 추출
    nickname = user.data.nickname;
    // email 추출
    email = user.data.email;
  } catch (error) {
    console.error(error);
    return;
  }

  // localStorage에 nickname, email 저장
  localStorage.setItem('nickname', nickname);
  localStorage.setItem('email', email);

  // 내 정보 수정으로 이동
  window.location.href = './delete-profile';
};
