//채팅 내용

document.addEventListener('DOMContentLoaded', () => {

    const socket = io('http://localhost:3000');

    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    const roomName = urlParams.get('roomName');

    const chatScroll = document.getElementById('chatscroll');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const roomNameElement = document.getElementById('roomName');

    let currentUser = generateUserName(); 

    // 사용자 이름 생성 함수
    function generateUserName() {
        const count = Math.floor(Math.random() * 1000) + 1;
        return `가나다${count}`;
    }

    // 채팅 목록을 자동으로 스크롤 하단으로 이동
    function scrollToBottom() {
        chatScroll.scrollTop = chatScroll.scrollHeight;
    }

    // 메시지를 채팅 목록에 추가하는 함수
    function addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${currentUser === message.author ? 'outgoing' : ''}`;
        messageElement.innerHTML = `
            <div class="chat-message-wrapper">
                <span class="chat-message-author">${message.author}</span>
                <div class="chat-message-bubble">
                    <span class="chat-message-body">${message.body}</span>
                </div>
            </div>
        `;
        chatScroll.appendChild(messageElement);
        scrollToBottom();
    }

    // 방 입장 시 서버에 'joinRoom' 이벤트 전송
    socket.emit('joinRoom', { roomId });

    // 서버로부터 'chat' 이벤트 수신
    socket.on('chat', (newMessage) => {
        console.log('새로운 메시지 수신:', newMessage);
        addMessage(newMessage);
    });

    // 메시지 전송 버튼 클릭 이벤트 처리   
    sendButton.addEventListener('click', () => {
        const inputValue = messageInput.value.trim();
        if (inputValue.length === 0) return;

        console.log('전송할 메시지:', inputValue);
        socket.emit('chat', { roomId, author: currentUser, body: inputValue });
        messageInput.value = ''; // 입력 필드 비우기
    });

    // Enter 키 입력 시 메시지 전송
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // 기본 Enter 동작 방지
            sendButton.click(); // 전송 버튼 클릭 이벤트와 동일
        }
    });

    // 방 이름을 화면에 표시
    if (roomNameElement && roomName) {
        roomNameElement.textContent = decodeURIComponent(roomName);
    }
});
