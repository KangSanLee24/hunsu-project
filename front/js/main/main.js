<<<<<<< HEAD
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
    { id: 12995, title: '실시간 채팅 2', users: 44 },
    { id: 13021, title: '실시간 채팅 3', users: 30 },
    { id: 12995, title: '실시간 채팅 4', users: 44 },
    { id: 13021, title: '실시간 채팅 5', users: 30 },
    { id: 12995, title: '실시간 채팅 6', users: 44 },
    { id: 13021, title: '실시간 채팅 7', users: 30 },
    { id: 12995, title: '실시간 채팅 8', users: 44 },
    { id: 13021, title: '실시간 채팅 9', users: 30 },
    { id: 12995, title: '실시간 채팅 10', users: 44 },
    { id: 13021, title: '실시간 채팅 11', users: 30 },
    { id: 12995, title: '실시간 채팅 12', users: 44 },
    { id: 13021, title: '실시간 채팅 13', users: 30 },
    { id: 12995, title: '실시간 채팅 14', users: 44 },
    { id: 13021, title: '실시간 채팅 15', users: 30 },
    { id: 12995, title: '실시간 채팅 16', users: 44 },
    { id: 13021, title: '실시간 채팅 17', users: 30 },
    { id: 12995, title: '실시간 채팅 18', users: 44 },
    { id: 13021, title: '실시간 채팅 19', users: 30 },
    { id: 12995, title: '실시간 채팅 20', users: 44 },
    { id: 13021, title: '실시간 채팅 21', users: 30 },
    { id: 12995, title: '실시간 채팅 22', users: 44 },
    { id: 13021, title: '실시간 채팅 23', users: 30 },
    { id: 12995, title: '실시간 채팅 24', users: 44 },
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
=======
import './styles/main.style.css';

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

const Main = () => {
  const app = document.getElementById('app');

  const header = createElement('header');
  const nav = createElement('nav');
  const navList = createElement('ul');
  const liveChatLink = createElement(
    'div',
    null,
    `<a style="margin-left: 20px;" href="./search">검색</a>`
  );
  const userId = createElement('div', null, '8990763');
  navList.appendChild(liveChatLink);
  navList.appendChild(userId);
  nav.appendChild(navList);

  const logo = createElement('div', 'logo', '5ZIRAP');
  const loginNav = createElement('nav');
  const loginList = createElement('ul');
  const loginLink = createElement('div', null, `<a href="./log-in">로그인</a>`);
  const signUpLink = createElement(
    'div',
    null,
    `<a style="margin-right: 20px;" href="./sign-up">회원가입</a>`
  );
  loginList.appendChild(loginLink);
  loginList.appendChild(signUpLink);
  loginNav.appendChild(loginList);

  header.appendChild(nav);
  header.appendChild(logo);
  header.appendChild(loginNav);
  app.appendChild(header);

  const main = createElement('main');

  const liveChatSection = createElement('section', 'live-chat');
  liveChatSection.appendChild(
    createElement('h2', null, '실시간 HOT LIVE CHAT')
  );
  const liveChatList = createElement('ul');
  liveChatData.forEach((item) => {
    liveChatList.appendChild(
      createElement('li', null, `${item.id} - ${item.title} [${item.users}명]`)
    );
  });
  liveChatSection.appendChild(liveChatList);
  main.appendChild(liveChatSection);

  const weeklyPostsSection = createElement('section', 'weekly-posts');
  weeklyPostsSection.appendChild(createElement('h2', null, '주간 HOT 게시글'));
  const weeklyPostsList = createElement('ul');
  weeklyPostsData.forEach((item) => {
    weeklyPostsList.appendChild(
      createElement(
        'li',
        null,
        `${item.id} - ${item.title} [${item.comments}명]`
      )
    );
  });
  weeklyPostsSection.appendChild(weeklyPostsList);
  main.appendChild(weeklyPostsSection);

  app.appendChild(main);

  const footer = createElement('footer');
  const footerMenu = createElement('div', 'footer-menu');
  footerMenu.appendChild(
    createElement('button', null, 'Live Chat', {
      onclick: () => (window.location.href = './chat-list'),
    })
  );
  footerMenu.appendChild(createElement('button', null, '게시판'));
  footerMenu.appendChild(
    createElement('button', null, '홈으로', {
      onclick: () => (window.location.href = './'),
    })
  );
  footerMenu.appendChild(createElement('button', null, '좋아요'));
  footerMenu.appendChild(
    createElement('button', null, '마이페이지', {
      onclick: () => (window.location.href = './my-page'),
    })
  );
  footer.appendChild(footerMenu);
  app.appendChild(footer);
};

// DOMContentLoaded 이벤트가 발생하면 Main 함수를 실행
document.addEventListener('DOMContentLoaded', Main);
>>>>>>> ac7a1f15a5801a8ef3133636dd789dd9ebb73b6a
