const liveChatData = [
  { id: 13021, title: '실시간 채팅 1', users: 30 },
  { id: 12995, title: '실시간 채팅 2', users: 44 },
  // 추가 데이터...
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

function renderList(data, elementId) {
  const listElement = document.getElementById(elementId);
  data.forEach((item) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${item.id} - ${item.title} [${item.users || item.comments}명]`;
    listElement.appendChild(listItem);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderList(liveChatData, 'liveChatList');
  renderList(weeklyPostsData, 'weeklyPostsList');
});
