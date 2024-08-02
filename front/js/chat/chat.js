import { API_BASE_URL } from "../../config/config.js";

async function getAuthor() {
    try{
        const accessToken = localStorage.getItem('accessToken');

        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            }
          });
    
          const result = await response.json();
          const author = result.data.nickname;

          return author;
    }catch {
        console.error('Error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    const socket = io('http://localhost:3000');

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
    try{
        currentUser = await getAuthor();
    } catch(error){
        console.error('Failed to get author:', error);
    }

    // 채팅 목록을 자동으로 스크롤 하단으로 이동
    function scrollToBottom() {
        chatScroll.scrollTop = chatScroll.scrollHeight;
    }

    // 메시지를 채팅 목록에 추가하는 함수
    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${currentUser === message.author ? 'outgoing' : ''}`;
        if(message.body){
            messageElement.innerHTML = `
            <div class="chat-message-wrapper">
                <span class="chat-message-author">${message.author}</span>
                <div class="chat-message-bubble">
                    <span class="chat-message-body">${message.body}</span>
                </div>
            </div>
        `;
        } else if (message.fileUrl) {
            messageElement.innerHTML = `
            <div class="chat-message-wrapper">
                <span class="chat-message-author">${message.author}</span>
                <div class="chat-message-bubble">
                    <img src="${message.fileUrl}" alt="Chat Image" style="max-width: 100%; height: auto;" />
                </div>
            </div>
        `;
        }

        chatScroll.appendChild(messageElement);
        scrollToBottom();
    }

    // 방 입장 시 서버에 'joinRoom' 이벤트 전송
    socket.emit('joinRoom', { roomId, author: currentUser });

    // 방 입장 시 'userJoined' 이벤트 수신
    socket.on('userJoined', (data) => {
        const notification = document.createElement('div');
        notification.classList.add('notification');
        notification.textContent = data.message;
        chatScroll.appendChild(notification);
        chatScroll.scrollTop = chatScroll.scrollHeight; // 최신 메시지로 스크롤
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
    });

    // 메시지 전송 버튼 클릭 이벤트 처리   
    sendButton.addEventListener('click', () => {
        const inputValue = messageInput.value.trim();
        const imageExists = file ? true : false;

        if (inputValue.length === 0 && !imageExists) return;

        if(inputValue.length > 0){
            console.log('전송할 메시지:', inputValue);
            socket.emit('chat', { roomId, author: currentUser, body: inputValue });
            messageInput.value = ''; // 입력 필드 비우기
        }

        if(imageExists) {
            console.log('전송할 이미지:', file);

            // 서버로 이미지 전송
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);
            formData.append('author', currentUser);

            fetch(`${API_BASE_URL}/chatrooms/${roomId}/image`, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const { fileUrl } = data;
                socket.emit('chatImage', { roomId, author: currentUser, fileUrl });
            })
            .catch(error => console.error('Error:', error));

            // 파일 입력 필드 초기화
            fileInput.value = '';
            imagePreview.style.display = 'none'; // 메시지 전송 후 이미지 미리보기 숨기기
            imagePreview.style.backgroundImage = ''; // 이미지 배경 초기화
            file = null; // 파일 변수 초기화
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

        if(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" />`;
                imagePreview.style.display = 'block'; // 이미지 미리보기 표시
            };
            reader.readAsDataURL(file);
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
    });
});