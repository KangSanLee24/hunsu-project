import { elapsedTime } from '../common/elapsed-time.js';
import { identifyUser } from '../common/identify-user.js';

/** 페이지에 필요한 변수 세팅 **/
// 1. 로그인 관련 변수 선언
const accessToken = localStorage.getItem('accessToken');
const user = accessToken ? await identifyUser(accessToken) : null;
const loginLink = document.querySelector('a[href="./log-in"]');
const signUpLink = document.querySelector('a[href="./sign-up"]');

// 2. 알람 리스트 관련 변수 선언
const afterAlarmList = document.getElementById('after-alarm-list');
const alarmListElement = document.getElementById('alarm-list');

// 3. 페이지네이션 관련 변수 선언
const pageNumbersElement = document.getElementById('page-numbers');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const currentPageLabel = document.getElementById('current-page-label');
let currentPage = 1; // 현재 페이지
let totalPages = 0; // 총 페이지 수
const alarmsPerPage = 10; // 페이지 당 게시글 수

/** 로그인 상태에 따른 분기 세팅 **/
// 1. 만약 로그인이 되어있다면
if (user) {
  // 1-1. 로그인O => 로그인 및 회원가입 버튼 [숨기기]
  if (loginLink) loginLink.style.display = 'none';
  if (signUpLink) signUpLink.style.display = 'none';
} else {
  // 1-2. 로그인X
  // 1-2-1. => 로그인 및 회원가입 버튼 [보이기]
  if (loginLink) loginLink.style.display = 'block';
  if (signUpLink) signUpLink.style.display = 'block';
  // 1-2-2. => '알람은 로그인 상태에서 확인하실 수 있습니다.' [메시지]
  afterAlarmList.innerHTML = `<h2 class="notLogIn">알람은 로그인 상태에서 확인하실 수 있습니다.</h2>`;
  afterAlarmList.appendChild(noShow);
}

/** 알람 목록 조회 API 호출 **/
async function fetchAlarmData(page) {
  try {
    // 1. API 호출 시 비어 있는 값을 포함하지 않도록 URL 구성
    const queryParams = new URLSearchParams({
      page: page,
      limit: alarmsPerPage,
    });

    // 2. fetch 받아오기 (알람 목록)
    const response = await fetch(`/api/alarms?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    // 3. fetch 받아온 result를 json으로
    const result = await response.json();

    // 4. 데이터 처리
    if (result.status === 200) {
      // 4-1. data.alarms가 배열인지 확인해서 맞으면
      if (Array.isArray(result.data.alarms)) {
        // 4-1-1. 렌더링 함수에 데이터 전달
        renderAlarmList(result.data.alarms);
        // 4-1-2. 총 페이지 수 업데이트
        totalPages = result.data.meta.totalPages;
        updatePagination();
      } else {
        // 4-2. data.alarms가 배열인지 확인해서 아니면
        console.error('알람 데이터 형식이 잘못되었습니다:', result.data.alarms);
      }
    } else {
      // 4-3. data.alarms를 애초에 조회하지 못한 경우 에러메시지
      console.error('알람 목록 조회 실패:', result.message);
    }
  } catch (error) {
    // 5. 그 이외에 API 호출 도중 오류가 발생한 경우
    console.error('API 호출 중 오류 발생:', error);
  }
}

/** 데이터 렌더링 함수 **/
function renderAlarmList(data) {
  // 1. 기본 세팅
  alarmListElement.innerHTML = '';
  // 2. 불러온 데이터를 하나하나 HTML화
  data.forEach((item) => {
    // 2-1. row 생성 준비
    const row = document.createElement('tr');
    // 2-2. 읽은 알람인지 아닌지 구별
    let check = '⬜';
    if (item.isChecked == true) {
      check = '✅';
    }
    // 2-3. 데이터로 row HTML 생성
    row.innerHTML = `
            <td>${item.fromType}</td>
            <td class="onClickAlarm" onClick="clickAlarm(${item.id})">${item.notification}</td>            
            <td>${elapsedTime(item.createdAt)}</td>
            <td><button class="checkAlarm" onClick="checkAlarm(${item.id})")>${check}</td>
            <td><button class="deleteAlarm" onClick="deleteAlarm(${item.id})">🗑️</button></td>        
        `;
    // 2-4. 생성된 row HTML 붙이기
    alarmListElement.appendChild(row);
  });
}

/** 페이지네이션 업데이트 함수 **/
function updatePagination() {
  // 1. 페이지네이션 붙일 세팅
  pageNumbersElement.innerHTML = '';
  // 2. 총 페이지 수에 따라 세팅
  for (let i = 1; i <= totalPages; i++) {
    // 2-1. 버튼 생성
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';
    // 2-2. 버튼 클릭 이벤트 활성화/비활성화
    if (i === currentPage) {
      // 2-2-1. 현재 페이지는 버튼 클릭 불가능
      pageButton.disabled = true;
    } else {
      // 2-2-2. 현재 페이지가 아니면 버튼 클릭 가능
      pageButton.addEventListener('click', () => {
        currentPage = i;
        fetchAlarmData(currentPage); // 클릭하면 fetch!!
      });
    }
    // 2-3. 생성된 페이지 버튼 HTML에 붙이기
    pageNumbersElement.appendChild(pageButton);
  }
  // 3. 현재 페이지가 1이면 <prev> 버튼 비활성화
  prevButton.disabled = currentPage === 1;
  // 4. 현재 패이지가 끝번이면 <next> 버튼 비활성화
  nextButton.disabled = currentPage === totalPages;
  // 5. 만약에 현재 페이지가 없으면 비활성화
  console.log(currentPageLabel);
  if (!currentPageLabel) {
    nextButton.disabled;
  }
}
/** (+) 페이지 이동 버튼 <prev> **/
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchAlarmData(currentPage);
  }
});
/** (+) 페이지 이동 버튼 <next> **/
nextButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchAlarmData(currentPage);
  }
});

/** 삭제 버튼 🗑️ **/
// 알람 개별 삭제 API 호출
async function deleteAlarm(alarmId) {
  try {
    // 0. 재확인
    if (window.confirm('해당 알람을 정말 삭제하시겠습니까?')) {
      // 1. 알람 개별 삭제 request => response 받기
      const response = await fetch(`/api/alarms/${alarmId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 2. 받아온 response를 json화
      const result = await response.json();

      // 3. 결과 처리
      if (response.status === 200) {
        // 3-1. API 호출에 성공한 경우
        // 3-1-1. 결과 메시지 엘러트
        alert(result.message);
        // 3-1-2. 새로 fetch
        fetchAlarmData(currentPage);
      } else {
        // 3-2. API 호출에 실패한 경우
        alert(result.message);
      }
    } else {
      alert('취소하셨습니다.');
    }
  } catch (error) {
    // 4. 그 밖의 에러 발생
    console.error('알람 개별 삭제 중 오류 발생:', error);
  }
}

/** 읽은 알람 모두 삭제 버튼 **/
// 읽은 알람 전체 삭제 API 호출
async function deleteAllAlarm() {
  try {
    // 0. 재확인
    if (window.confirm('[읽음O]상태의 알람을 모두 삭제하시겠습니까?')) {
      // 1. 읽은 알람 전체 삭제 request => response 받기
      const response = await fetch(`/api/alarms`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 2. 받아온 response를 json화
      const result = await response.json();

      // 3. 결과 처리
      if (response.status === 200) {
        // 3-1. API 호출에 성공한 경우
        // 3-1-1. 결과 메시지 엘러트
        alert(result.message);
        // 3-1-2. 새로 fetch
        fetchAlarmData(currentPage);
      } else {
        // 3-2. API 호출에 실패한 경우
        alert(result.message);
      }
    } else {
      alert('취소하셨습니다.');
    }
  } catch (err) {
    // 4. 그 밖의 에러 발생
    console.error('읽은 알람 모두 삭제 중 오류 발생:', error);
  }
}

/** 모두 읽음 처리 버튼 **/
// 모두 읽음 처리 API 호출
async function readAllAlarm() {
  try {
    // 0. 재확인
    if (window.confirm('모든 알람을 [읽음O]상태로 변경하시겠습니까?')) {
      // 1. 남은 알람 전부 읽음 처리 request => response 받기
      const response = await fetch(`/api/alarms`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 2. 받아온 response를 json화
      const result = await response.json();

      // 3. 결과 처리
      if (response.status === 200) {
        // 3-1. API 호출에 성공한 경우
        // 3-1-1. 결과 메시지 엘러트
        alert(result.message);
        // 3-1-2. 새로 fetch
        fetchAlarmData(currentPage);
      } else {
        // 3-2. API 호출에 실패한 경우
        alert(result.message);
      }
    } else {
      alert('취소하셨습니다.');
    }
  } catch (err) {
    // 4. 그 밖의 에러 발생
    console.error('남은 알람 모두 읽음 처리 중 오류 발생:', error);
  }
}

/** 읽음 처리 반전 **/
async function checkAlarm(alarmId) {
  try {
    // 1. 알람 [읽음]상태 취소 request => response 받기
    const response = await fetch(`/api/alarms/${alarmId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    // 2. 받아온 response를 json화
    const result = await response.json();

    // 3. 결과 처리
    if (response.status === 200) {
      // 3-1. API 호출에 성공한 경우
      // 3-1-1. 결과 메시지 (콘솔)
      console.log(result.message);
      // 3-1-2. 새로 fetch
      fetchAlarmData(currentPage);
    } else {
      // 3-2. API 호출에 실패한 경우
      alert(result.message);
    }
  } catch (error) {
    // 4. 그 밖의 에러 발생
    console.error('알람 읽음 상태 변경 중 오류 발생:', error);
  }
}

/** 해당 게시글로 이동 **/
// 알람 메시지를 클릭하면 해당 게시글로 이동
async function clickAlarm(alarmId) {
  try {
    // 0. 재확인
    if (window.confirm('해당 게시글로 이동하시겠습니까?')) {
      // 1. 알람 클릭 request => response 받기
      const response = await fetch(`/api/alarms/${alarmId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      // 2. 받아온 response를 json화
      const result = await response.json();

      // 3. 결과 처리
      if (response.status === 200) {
        // 3-1. API 호출에 성공한 경우 링크로 이동
        window.location.href = `post-detail?id=${result.data}`;
      } else {
        // 3-2. API 호출에 실패한 경우
        alert(result.message);
      }
    } else {
      alert('취소하셨습니다.');
    }
  } catch (error) {
    // 4. 그 밖의 에러 발생
    console.error('알람 클릭 중 오류 발생:', error);
  }
}

/** 페이지 시작되면 '알람 목록 조회 API 호출' CALL **/
fetchAlarmData(currentPage);

/** js함수를 전역으로 끄집어내서 html에서 사용 **/
window.deleteAlarm = deleteAlarm;
window.deleteAllAlarm = deleteAllAlarm;
window.readAllAlarm = readAllAlarm;
window.checkAlarm = checkAlarm;
window.clickAlarm = clickAlarm;
