import { identifyUser } from '../common/identify-user.js';

/** 페이지에 필요한 변수 세팅 **/
// 1. 로그인 관련 변수 선언
const accessToken = localStorage.getItem('accessToken');
const user = accessToken ? await identifyUser(accessToken) : null;
const loginLink = document.querySelector('a[href="./log-in"]');
const signUpLink = document.querySelector('a[href="./sign-up"]');

// 2. 알람 리스트 관련 변수 선언
const afterLogList = document.getElementById('after-log-list');
const logListElement = document.getElementById('log-list');

// 3. 페이지네이션 관련 변수 선언
const pageNumbersElement = document.getElementById('page-numbers');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const currentPageLabel = document.getElementById('current-page-label');
let currentPage = 1; // 현재 페이지
let totalPages = 0; // 총 페이지 수
const logsPerPage = 20; // 페이지 당 게시글 수

// 4. 조회 관련 변수 선언
const filterButton = document.getElementById('filter-button');
const contextSelect = document.getElementById('context-select');
const levelSelect = document.getElementById('level-select');
const statusSelect = document.getElementById('status-select');
const methodSelect = document.getElementById('method-select');
const userIdInput = document.getElementById('userid-input');
const keywordInput = document.getElementById('keyword-input');
const timeInput = document.getElementById('time-input');

/** 로그인 상태에 따른 분기 세팅 **/
// 1. 만약 로그인이 되어있다면
if (user && user.data.role == 'ADMIN') {
  // 1-1. 로그인O + 관리자O => 로그인 및 회원가입 버튼 [숨기기]
  if (loginLink) loginLink.style.display = 'none';
  if (signUpLink) signUpLink.style.display = 'none';
} else if (user) {
  // 1-2. 로그인O + 관리자X => 로그인 및 회원가입 버튼 [숨기기]
  if (loginLink) loginLink.style.display = 'none';
  if (signUpLink) signUpLink.style.display = 'none';
  // 1-3-2. => '관리자 로그인 상태에서 확인하실 수 있습니다.' [메시지]
  afterLogList.innerHTML = `<h2 class="notLogIn">로그는 관리자 로그인 상태에서 확인하실 수 있습니다.</h2>`;
  afterLogList.appendChild(noShow);
} else {
  // 1-3. 로그인X
  // 1-3-1. => 로그인 및 회원가입 버튼 [보이기]
  if (loginLink) loginLink.style.display = 'block';
  if (signUpLink) signUpLink.style.display = 'block';
  // 1-3-2. => '관리자 로그인 상태에서 확인하실 수 있습니다.' [메시지]
  afterLogList.innerHTML = `<h2 class="notLogIn">로그는 관리자 로그인 상태에서 확인하실 수 있습니다.</h2>`;
  afterLogList.appendChild(noShow);
}

/** 로그 목록 조회 API 호출 **/
async function fetchLogData(
  page,
  context,
  level,
  status,
  method,
  userId,
  keyword,
  time
) {
  try {
    // 1. API 호출을 위한 queryParams
    const queryParams = new URLSearchParams({
      page: page,
      limit: logsPerPage,
    });
    // 1-1. 입력 데이터 정리
    if (context) {
      queryParams.append('contextType', context);
    }
    if (level) {
      queryParams.append('levelType', level);
    }
    if (status) {
      queryParams.append('statusCodeType', status);
    }
    if (method) {
      queryParams.append('methodType', method);
    }
    if (userId) {
      queryParams.append('userId', userId);
    }
    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    if (time) {
      queryParams.append('time', time);
    }

    // 2. fetch 받아오기 (로그 목록)
    const response = await fetch(`/api/logs?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    // 3. fetch 받아온 result를 json으로
    const result = await response.json();
    console.log(result.data.logs);

    // 4. 데이터 처리
    if (result.status === 200) {
      // 4-1. data가 배열인지 확인해서 맞으면
      if (Array.isArray(result.data.logs)) {
        // 4-1-1. 렌더링 함수에 데이터 전달
        renderLogList(result.data.logs);
        // 4-1-2. 총 페이지 수 업데이트
        totalPages = result.data.meta.totalPages;
        updatePagination();
      } else {
        // 4-2. data가 배열인지 확인해서 아니면
        console.error('로그 데이터 형식이 잘못되었습니다:', result.data.logs);
      }
    } else {
      // 4-3. data를 애초에 조회하지 못한 경우 에러메시지
      console.error('로그 목록 조회 실패:', result.message);
    }
  } catch (error) {
    // 5. 그 이외에 API 호출 도중 오류가 발생한 경우
    console.error('API 호출 중 오류 발생:', error);
  }
}

/** 데이터 렌더링 함수 **/
function renderLogList(data) {
  // 1. 기본 세팅
  logListElement.innerHTML = '';
  // 2. 불러온 데이터를 하나하나 HTML화
  data.forEach((item) => {
    // 2-1. row 생성 준비
    const row = document.createElement('tr');

    // 2-2. level 색깔 지정
    let color = '';
    if (item.level == 'info') {
      color = 'green';
    } else if (item.level == 'warn') {
      color = 'orange';
    } else if (item.level == 'error') {
      color = 'red';
    } else {
      color = 'black';
    }

    // 2-3. 데이터로 row HTML 생성
    row.innerHTML = `
              <td class="onClickLog" onClick="clickLog(${item.id})">${item.timestamp}</td> 
              <td class="onClickLog" onClick="clickLog(${item.id})">${item.context}</td>            
              <td class="onClickLog" onClick="clickLog(${item.id})" style="color:${color}">${item.level}</td>
              <td class="onClickLog" onClick="clickLog(${item.id})">${item.message}</td>
              <td><button class="deleteLog" onClick="deleteLog(${item.id})">🗑️</button></td>        
          `;
    // 2-4. 생성된 row HTML 붙이기
    logListElement.appendChild(row);
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
        fetchLogData(
          currentPage,
          contextSelect.value,
          levelSelect.value,
          statusSelect.value,
          methodSelect.value,
          userIdInput.value,
          keywordInput.value,
          timeInput.value
        ); // 클릭하면 fetch!!
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
    fetchLogData(
      currentPage,
      contextSelect.value,
      levelSelect.value,
      statusSelect.value,
      methodSelect.value,
      userIdInput.value,
      keywordInput.value,
      timeInput.value
    );
  }
});
/** (+) 페이지 이동 버튼 <next> **/
nextButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchLogData(
      currentPage,
      contextSelect.value,
      levelSelect.value,
      statusSelect.value,
      methodSelect.value,
      userIdInput.value,
      keywordInput.value,
      timeInput.value
    );
  }
});

/** 조회 버튼 **/
filterButton.addEventListener('click', () => {
  currentPage = 1; // 조회 시 첫 페이지로 초기화
  fetchLogData(
    currentPage,
    contextSelect.value,
    levelSelect.value,
    statusSelect.value,
    methodSelect.value,
    userIdInput.value,
    keywordInput.value,
    timeInput.value
  );
});

/** 삭제 버튼 🗑️ **/
// 로그 삭제 API 호출
async function deleteLog(logId) {
  try {
    // 0. 재확인
    if (window.confirm('해당 로그를 정말 삭제하시겠습니까?')) {
      // 1. 로그 삭제 request => response 받기
      const response = await fetch(`/api/logs/${logId}`, {
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
        fetchLogData(currentPage);
      } else {
        // 3-2. API 호출에 실패한 경우
        alert(result.message);
      }
    } else {
      alert('취소하셨습니다.');
    }
  } catch (error) {
    // 4. 그 밖의 에러 발생
    console.error('로그 삭제 중 오류 발생:', error);
  }
}

/** 로그 클릭 **/
async function clickLog(logId) {
  try {
    // 1. 로그 삭제 request => response 받기
    const response = await fetch(`/api/logs/${logId}`, {
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
      // 3-1. API 호출에 성공한 경우
      // 3-1-1. 결과 메시지 엘러트
      console.log(result.message);
      console.log(result.data);
      // 3-1-2.
      const data = `log#${result.data.id} [${result.data.timestamp}]
context: ${result.data.context} | level: ${result.data.level} | statusCode: ${result.data.resStatus}
request: [${result.data.reqMethod}] ${result.data.reqOriginalUrl} (${result.data.resDuration}ms)
user: ${result.data.userId} (${result.data.userIp})
${result.data.userAgent}`;
      alert(data);
    } else {
      // 3-2. API 호출에 실패한 경우
      alert(result.message);
    }
  } catch (error) {
    // 4. 그 밖의 에러 발생
    console.error('로그 삭제 중 오류 발생:', error);
  }
}

/** 페이지 시작되면 '로그 목록 조회 API 호출' CALL **/
fetchLogData(currentPage);

/** js함수를 전역으로 끄집어내서 html에서 사용 **/
window.deleteLog = deleteLog;
window.clickLog = clickLog;
