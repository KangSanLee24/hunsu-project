import React from 'react';
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

export const Main = () => {
  return (
    <div>
      <header>
        <nav>
          <ul>
            <div>
              <a style={{ marginLeft: 20 + 'px' }} href="./search">
                검색
              </a>
            </div>
            <div>{'8990763'}</div>
          </ul>
        </nav>
        <div className="logo">5ZIRAP</div>
        <nav>
          <ul>
            <div>
              <a href="./log-in">로그인</a>
            </div>
            <div>
              <a style={{ marginRight: 20 + 'px' }} href="./sign-up">
                회원가입
              </a>
            </div>
          </ul>
        </nav>
      </header>

      <main>
        <section className="live-chat">
          <h2>실시간 HOT LIVE CHAT</h2>
          <ul>
            {liveChatData.map((item) => (
              <li key={item.id}>
                {item.id} - {item.title} [{item.users}명]
              </li>
            ))}
          </ul>
        </section>

        <section className="weekly-posts">
          <h2>주간 HOT 게시글</h2>
          <ul>
            {weeklyPostsData.map((item) => (
              <li key={item.id}>
                {item.id} - {item.title} [{item.comments}명]
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer>
        <div className="footer-menu">
          <button onClick={() => (window.location.href = './chat-list')}>
            Live Chat
          </button>
          <button>게시판</button>
          <button onClick={() => (window.location.href = './')}>홈으로</button>
          <button>좋아요</button>
          <button onClick={() => (window.location.href = './my-page')}>
            마이페이지
          </button>
        </div>
      </footer>
    </div>
  );
};
