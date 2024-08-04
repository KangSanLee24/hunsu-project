document.addEventListener('DOMContentLoaded', () => {
  const liveChatData = [];
  const weeklyPostsData = [];

  const createElement = (tag, className, innerHTML) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  };

  const liveChatSection = document.querySelector('.live-chat');
  const liveChatList = document.getElementById('liveChatList');
  // liveChatData.forEach((chat) => {
  //   const listItem = createElement(
  //     'li',
  //     null,
  //     `${chat.title} (${chat.users}명)`
  //   );
  //   liveChatList.appendChild(listItem);
  // });

  const weeklyPostsSection = document.querySelector('.weekly-posts');
  const weeklyPostsList = document.getElementById('weeklyPostsList');
  // weeklyPostsData.forEach((post) => {
  //   const listItem = createElement(
  //     'li',
  //     null,
  //     `${post.title} (${post.comments}명)`
  //   );
  //   weeklyPostsList.appendChild(listItem);
  // });
});
