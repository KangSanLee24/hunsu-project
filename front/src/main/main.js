document.addEventListener('DOMContentLoaded', () => {
  const accessToken = localStorage.getItem('accessToken');
  const isLoggedIn = !!accessToken;

  const loginLink = document.querySelector('a[href="./log-in.html"]');
  const signUpLink = document.querySelector('a[href="./sign-up.html"]');

  if (isLoggedIn) {
    // 로그인 상태일 때 로그인 및 회원가입 버튼 숨기기
    if (loginLink) loginLink.style.display = 'none';
    if (signUpLink) signUpLink.style.display = 'none';
  } else {
    // 로그인 상태가 아닐 때 로그인 및 회원가입 버튼 보이기
    if (loginLink) loginLink.style.display = 'block';
    if (signUpLink) signUpLink.style.display = 'block';
  }

  const liveChatData = [
    { id: 13021, title: '실시간 채팅 1', users: 30 },
    { id: 12995, title: '실시간 채팅 2', users: 44 },
    { id: 12995, title: '주간 게시글 2', users: 44 },
    { id: 13021, title: '주간 게시글 3', users: 30 },
    { id: 12995, title: '주간 게시글 4', users: 44 },
    { id: 13021, title: '주간 게시글 5', users: 30 },
    { id: 12995, title: '주간 게시글 6', users: 44 },
    { id: 13021, title: '주간 게시글 7', users: 30 },
    { id: 12995, title: '주간 게시글 8', users: 44 },
    { id: 13021, title: '주간 게시글 9', users: 30 },
    { id: 12995, title: '주간 게시글 10', users: 44 },
    { id: 13021, title: '주간 게시글 11', users: 30 },
    { id: 12995, title: '주간 게시글 12', users: 44 },
    { id: 13021, title: '주간 게시글 13', users: 30 },
    { id: 12995, title: '주간 게시글 14', users: 44 },
    { id: 13021, title: '주간 게시글 15', users: 30 },
    { id: 12995, title: '주간 게시글 16', users: 44 },
    { id: 13021, title: '주간 게시글 17', users: 30 },
    { id: 12995, title: '주간 게시글 18', users: 44 },
    { id: 13021, title: '주간 게시글 19', users: 30 },
    { id: 12995, title: '주간 게시글 20', users: 44 },
    { id: 13021, title: '주간 게시글 21', users: 30 },
    { id: 12995, title: '주간 게시글 22', users: 44 },
    { id: 13021, title: '주간 게시글 23', users: 30 },
    { id: 12995, title: '주간 게시글 24', users: 44 },
  ];

  const weeklyPostsData = [
    { id: 13021, title: '주간 게시글 1', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    { id: 13021, title: '주간 게시글 3', comments: 30 },
    { id: 12995, title: '주간 게시글 4', comments: 44 },
    { id: 13021, title: '주간 게시글 5', comments: 30 },
    { id: 12995, title: '주간 게시글 6', comments: 44 },
    { id: 13021, title: '주간 게시글 7', comments: 30 },
    { id: 12995, title: '주간 게시글 8', comments: 44 },
    { id: 13021, title: '주간 게시글 9', comments: 30 },
    { id: 12995, title: '주간 게시글 10', comments: 44 },
    { id: 13021, title: '주간 게시글 11', comments: 30 },
    { id: 12995, title: '주간 게시글 12', comments: 44 },
    { id: 13021, title: '주간 게시글 13', comments: 30 },
    { id: 12995, title: '주간 게시글 14', comments: 44 },
    { id: 13021, title: '주간 게시글 15', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    { id: 13021, title: '주간 게시글 1', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    { id: 13021, title: '주간 게시글 1', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    { id: 13021, title: '주간 게시글 1', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    { id: 13021, title: '주간 게시글 1', comments: 30 },
    { id: 12995, title: '주간 게시글 2', comments: 44 },
    // 추가 데이터...
  ];

  const createElement = (tag, className, innerHTML) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  };

  const liveChatSection = document.querySelector('.live-chat');
  const liveChatList = document.getElementById('liveChatList');
  liveChatData.forEach((chat) => {
    const listItem = createElement(
      'li',
      null,
      `${chat.title} (${chat.users}명)`
    );
    liveChatList.appendChild(listItem);
  });

  const weeklyPostsSection = document.querySelector('.weekly-posts');
  const weeklyPostsList = document.getElementById('weeklyPostsList');
  weeklyPostsData.forEach((post) => {
    const listItem = createElement(
      'li',
      null,
      `${post.title} (${post.comments}명)`
    );
    weeklyPostsList.appendChild(listItem);
  });
});
