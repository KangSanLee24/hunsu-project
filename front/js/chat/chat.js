async function getAuthor() {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await fetch(`/api/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    const author = result.data.nickname;
    const authorId = result.data.id;

    return { author, authorId };
  } catch {
    console.error('Error:', error);
    // throw error;
    return;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 로그인 여부 확인
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
    window.location.href = '/log-in';
    return;
  }

  const socket = io('wss://5zirap.shop/', {
    transports: ['websocket']
 });

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('roomId');
  const roomName = urlParams.get('roomName');

  const chatScroll = document.getElementById('chatscroll');
  const messageInput = document.getElementById('messageInput');
  const sendButton = document.getElementById('sendButton');
  const roomNameElement = document.getElementById('roomName');
  const fileInput = document.getElementById('fileInput');
  const imagePreview = document.getElementById('imagePreview');

  let file = null; // 파일 변수 초기화

  let currentUser;
  let currentUserId;
  try {
    const authorData = await getAuthor();
    currentUser = authorData.author;
    currentUserId = authorData.authorId;
  } catch (error) {
    console.error('Failed to get author:', error);
    alert('로그인 정보가 올바르지 않습니다. 로그인 페이지로 이동합니다.');
    window.location.href = '/log-in'; // 로그인 페이지 경로로 리다이렉트
    return; // 이후 코드를 실행하지 않도록 중단
  }

  /** 멤버 목록 토글 */
  const toggleMembersButton = document.getElementById("toggleMembersButton");
  const membersList = document.getElementById("membersList");
  const closeMembersButton = document.getElementById("closeMembersButton");
  const membersContainer = document.getElementById("membersContainer");

  // 멤버 목록 토글 버튼 클릭 시
  toggleMembersButton.addEventListener("click", function () {
    if (membersList.style.display === "none") {
      membersList.style.display = "block";
      fetchMembers(roomId);  // API 호출하여 멤버 목록 가져오기
    } else {
      membersList.style.display = "none";
    }
  });

  // 닫기 버튼 클릭 시
  closeMembersButton.addEventListener("click", function () {
    membersList.style.display = "none";
  });

  function fetchMembers(roomId) {
    fetch(`/api/chatrooms/${roomId}/member`)
      .then(response => response.json())
      .then(data => {
        const member = data.member;
        const owner = data.owner[0]; 
        membersContainer.innerHTML = ""; // 기존 목록 초기화

        member.forEach(member => {
          const li = document.createElement("li");
        
          // 닉네임과 방장 여부 확인
          if (member.nickname === owner.nickname) {
            li.textContent = `${member.nickname}     👑방장`; // 방장 표시 추가
          } else {
            li.textContent = member.nickname;
          }
          
          membersContainer.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error fetching members:', error);
      membersContainer.innerHTML = "<li>멤버 목록을 불러오지 못했습니다.</li>";
    });
}

  // 채팅 목록을 자동으로 스크롤 하단으로 이동
  function scrollToBottom() {
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  // 메시지를 채팅 목록에 추가하는 함수
  function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${currentUser === message.author ? 'outgoing' : ''}`;

    if (message.body) {
      messageElement.innerHTML = `
            <div class="chat-message-wrapper">
                <span class="chat-message-author">${message.author}</span>
                <div class="chat-message-bubble">
                    <span class="chat-message-body">${message.body}</span>
                </div>
                <span class="chat-message-time">${message.chatTime}</span>
            </div>
        `;
    } else if (message.fileUrl) {
      messageElement.innerHTML = `
            <div class="chat-message-wrapper">
                <span class="chat-message-author">${message.author}</span>
                <div class="chat-message-bubble">
                    <img src="${message.fileUrl}" alt="Chat Image" style="max-width: 100%; height: auto;" />
                </div>
                <span class="chat-message-time">${message.imageTime}</span>
            </div>
        `;
    }

    chatScroll.appendChild(messageElement);
    scrollToBottom();

    if (message.fileUrl) {
      // 이미지 로드 후 스크롤 하단으로 이동
      const img = messageElement.querySelector('img');
      img.onload = () => {
        chatScroll.appendChild(messageElement);
        scrollToBottom(); // 이미지가 로드된 후 스크롤
      };
    }
  }

  // 방 입장 시 서버에 'joinRoom' 이벤트 전송
  socket.emit('joinRoom', {
    roomId,
    author: currentUser,
    authorId: currentUserId,
  });

  // 방 입장 시 'userJoined' 이벤트 수신
  socket.on('userJoined', (data) => {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = data.message;
    chatScroll.appendChild(notification);
    chatScroll.scrollTop = chatScroll.scrollHeight; // 최신 메시지로 스크롤

    fetchMembers(roomId);
  });

  // 서버로부터 'chat' 이벤트 수신
  socket.on('chat', (newMessage) => {
    console.log('새로운 메시지 수신:', newMessage);
    addMessage(newMessage);
  });

  // 서버로부터 'chatImage' 이벤트 수신
  socket.on('chatImage', (ImageMessage) => {
    console.log('새로운 이미지 수신:', ImageMessage);
    addMessage(ImageMessage);

    // 채팅방 상단에 고정할 이미지 표시
    const fixedImageDiv = document.getElementById('fixedImage');
    fixedImageDiv.style.display = 'block'; // 이미지 표시

    // 고정핀 텍스트가 이미 존재하는 경우 변경하지 않음
    if (!fixedImageDiv.querySelector('.fixed-header')) {
      const header = document.createElement('div');
      header.className = 'fixed-header';
      header.textContent = '📌 고정된 이미지';
      fixedImageDiv.appendChild(header);
    }

    // 이미지 업데이트
    const img = document.getElementById('fixedImageContent');
    img.src = ImageMessage.fileUrl; // 서버에서 받은 새로운 이미지 URL로 업데이트

    // 작성자 정보 업데이트
    const authorName = document.getElementById('authorName');
    authorName.textContent = `${ImageMessage.author}`; // 작성자 정보 업데이트
  });

  //서버로부터 'lastImage' 이벤트 수신
  socket.on('lastImage', (ImageMessage) => {
    // 채팅방 상단에 고정할 이미지 표시
    const fixedImageDiv = document.getElementById('fixedImage');
    fixedImageDiv.style.display = 'block'; // 이미지 표시

    // 고정핀 텍스트가 이미 존재하는 경우 변경하지 않음
    if (!fixedImageDiv.querySelector('.fixed-header')) {
      const header = document.createElement('div');
      header.className = 'fixed-header';
      header.textContent = '📌 고정된 이미지';
      fixedImageDiv.appendChild(header);
    }

    // 이미지 업데이트
    const img = document.getElementById('fixedImageContent');
    img.src = ImageMessage.fileUrl; // 서버에서 받은 새로운 이미지 URL로 업데이트

    // 작성자 정보 업데이트
    const authorName = document.getElementById('authorName');
    authorName.textContent = `${ImageMessage.author}`; // 작성자 정보 업데이트
  });

  // 메시지 전송 버튼 클릭 이벤트 처리
  sendButton.addEventListener('click', () => {
    const accessToken = localStorage.getItem('accessToken');
    const inputValue = messageInput.value.trim();
    const imageExists = file ? true : false;

    if (inputValue.length === 0 && !imageExists) return;

    if (inputValue.length > 0) {
      console.log('전송할 메시지:', inputValue);
      socket.emit('chat', { roomId, author: currentUser, body: inputValue });
      messageInput.value = ''; // 입력 필드 비우기
      messageInput.style.fontWeight = 'normal'; // 기본 스타일로 되돌리기
      messageInput.style.color = 'black'; // 기본 색상
    }

    if (imageExists) {
      console.log('전송할 이미지:', file);

      // 서버로 이미지 전송
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);
      formData.append('author', currentUser);

      fetch(`/api/chatrooms/${roomId}/image`, {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          const { fileUrl } = data;
          socket.emit('chatImage', { roomId, author: currentUser, fileUrl });
        })
        .catch((error) => console.error('Error:', error));

      // 파일 입력 필드 초기화
      fileInput.value = '';
      imagePreview.style.display = 'none'; // 메시지 전송 후 이미지 미리보기 숨기기
      imagePreview.style.backgroundImage = ''; // 이미지 배경 초기화
      file = null; // 파일 변수 초기화
    }
  });

  // 스페이스바 입력 시 스타일 변경
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === '#') {
      messageInput.style.fontWeight = 'bode';
      messageInput.style.color = 'red';
    }
  });

  // 스페이스바 입력 시 스타일 변경
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      messageInput.style.fontWeight = 'normal';
      messageInput.style.color = 'black';
    }
  });

  // Enter 키 입력 시 메시지 전송
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 기본 Enter 동작 방지
      sendButton.click(); // 전송 버튼 클릭 이벤트와 동일
    }
  });

  // 파일 선택 시 이미지 미리보기
  fileInput.addEventListener('change', (e) => {
    file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.innerHTML = `
            <img src="${e.target.result}" alt="Image Preview" />
            <span class="close-image" id="closeImage" style="position: absolute; left: 80px; cursor: pointer; font-size: 20px; z-index: 10;">❎</span>`;
        imagePreview.style.display = 'block'; // 이미지 미리보기 표시

        const closeImage = document.getElementById('closeImage');

        closeImage.addEventListener('click', () => {
          // 파일 입력 필드 초기화
          fileInput.value = '';
          imagePreview.style.display = 'none';
          imagePreview.style.backgroundImage = ''; // 이미지 배경 초기화
          file = null; // 파일 변수 초기화
        });
      };
      reader.readAsDataURL(file);
    }
  });

  // 접기/펼치기 버튼 클릭 이벤트 핸들러 추가
  const toggleIcon = document.getElementById('toggleIcon');
  toggleIcon.addEventListener('click', () => {
    const img = document.getElementById('fixedImageContent');
    const isHidden = img.style.display === 'none';

    if (isHidden) {
      img.style.display = 'block';
      toggleIcon.textContent = '🔼'; // 펼쳐진 상태일 때 아이콘 변경
    } else {
      img.style.display = 'none';
      toggleIcon.textContent = '🔽'; // 접힌 상태일 때 아이콘 변경
    }
  });

  // 방 이름을 화면에 표시
  if (roomNameElement && roomName) {
    roomNameElement.textContent = decodeURIComponent(roomName);
  }

  // 서버로부터 'userLeft' 이벤트 수신
  socket.on('userLeft', (data) => {
    console.log('이벤트 수신');
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = data.message;
    chatScroll.appendChild(notification);
    chatScroll.scrollTop = chatScroll.scrollHeight; // 최신 메시지로 스크롤

    fetchMembers(roomId);
  });

  // 서버로부터 'ownerLeft' 이벤트 수신
  socket.on('ownerLeft', () => {
    console.log('ownerLeft');
    alert('방장이 채팅방을 나갔습니다. 채팅 목록 페이지로 이동합니다.');
    window.location.href = '/chat-list';
  });

  socket.on('outRoom', () => {
    alert('삭제된 채팅방입니다. 채팅 목록 페이지로 이동합니다.');
    window.location.href = '/chat-list';
  });
});
