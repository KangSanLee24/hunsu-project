import { renderHashtagRank } from '../index/index.js'

/** SSE 알람 **/
export function alarmSSE(userId) {
    const eventSource = new EventSource(`/api/alarms/sse/${userId}`);

    // 1. SSE - 메시지 받기
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type == 'alarm') {
        console.log(`알람: ${data.message}`);
        alert(`알람: ${data.message}`);
      } else if (data.type == 'hashtag') {
        // 현재 페이지가 메인페이지 인 경우에만
        const nowUrl = localStorage.getItem('redirectUrl');
        if (
          nowUrl == 'http://localhost:3000' ||
          nowUrl == 'http://localhost:3000/' ||
          nowUrl == 'http://localhost:3000/index' ||
          nowUrl == 'https://5zirap.shop' ||
          nowUrl == 'https://5zirap.shop/' ||
          nowUrl == 'https://5zirap.shop/index'
        ) {
          renderHashtagRank(data.data);
        }
      }
    };

    // 2. SSE - 알람 활성화 알림
    eventSource.onopen = () => {
      console.log('서버의 알람기능과 연결되었습니다.');
    };

    // 3. SSE - 알람 비활성화 알림
    eventSource.onclose = () => {
      console.log('서버의 알람기능을 종료했습니다.');
    };

    // 4. SSE - 알람 에러
    eventSource.onerror = (error) => {
      console.error(
        '서버와의 연결이 끊겨 일시적으로 알람이 중단되었습니다. 새로고침시 다시 연결됩니다.'
      );
    };

    // 페이지 이탈 시 SSE 연결 종료
    window.addEventListener('unload', (e) => {
      e.preventDefault();
      eventSource.close();
    });
  }