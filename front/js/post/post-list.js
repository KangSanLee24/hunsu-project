import { elapsedTime } from '../common/elapsed-time.js';
import { identifyUser } from '../common/identify-user.js';

const boardListElement = document.getElementById('board-list');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const filterButton = document.getElementById('filter-button');
const pageNumbersElement = document.getElementById('page-numbers');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const currentPageLabel = document.getElementById('current-page-label');
const keywordInput = document.getElementById('keyword-input');

// 로그인 관련
const accessToken = localStorage.getItem('accessToken');
const user = accessToken ? await identifyUser(accessToken) : null;

let currentPage = 1; // 현재 페이지
let totalPages = 0; // 총 페이지 수
const postsPerPage = 20; // 페이지 당 게시글 수

// API 호출 함수
async function fetchBoardData(category, sort, page, keyword) {
  try {
    // API 호출 시 비어 있는 값을 포함하지 않도록 URL 구성
    const queryParams = new URLSearchParams({
      page: page,
      limit: postsPerPage,
    });

    if (category) {
      queryParams.append('category', category);
    }
    if (sort) {
      queryParams.append('sort', sort);
    }
    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    const response = await fetch(`/api/posts?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (result.status === 200) {
      // data.posts가 배열인지 확인
      if (Array.isArray(result.data.posts)) {
        renderBoardList(result.data.posts); // posts 배열을 전달
        totalPages = result.data.meta.totalPages; // 총 페이지 수 업데이트
        updatePagination();
      } else {
        console.error(
          '게시글 데이터 형식이 잘못되었습니다:',
          result.data.posts
        );
      }
    } else {
      console.error('게시글 목록 조회 실패:', result.message);
    }
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
  }
}

// 데이터 렌더링 함수
function renderBoardList(data) {
  boardListElement.innerHTML = '';
  data.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.category}</td>
            <td><a href="post-detail?id=${item.id}">${item.title}</a></td>
            <td>${item.nickname}</td>
            <td>${elapsedTime(item.createdAt)}</td>
            <td>${item.numComments}</td>
        `;
    boardListElement.appendChild(row);
  });
}

// 페이지네이션 업데이트 함수
function updatePagination() {
  pageNumbersElement.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.className = i === currentPage ? 'active' : '';

    // 현재 페이지인 경우 클릭 이벤트 비활성화
    if (i === currentPage) {
      pageButton.disabled = true; // 현재 페이지 버튼 비활성화
    } else {
      pageButton.addEventListener('click', () => {
        currentPage = i;
        fetchBoardData(
          categorySelect.value,
          sortSelect.value,
          currentPage,
          keywordInput.value
        );
      });
    }

    pageNumbersElement.appendChild(pageButton);
  }
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
}

// 필터 버튼 클릭 시 API 호출
filterButton.addEventListener('click', () => {
  currentPage = 1; // 검색 시 첫 페이지로 초기화
  fetchBoardData(
    categorySelect.value,
    sortSelect.value,
    currentPage,
    keywordInput.value
  );
});

/** 페이지 이동 버튼 클릭 이벤트 */
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchBoardData(
      categorySelect.value,
      sortSelect.value,
      currentPage,
      keywordInput.value
    );
  }
});

/** 페이지 이동 버튼 클릭 이벤트 */
nextButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchBoardData(
      categorySelect.value,
      sortSelect.value,
      currentPage,
      keywordInput.value
    );
  }
});

// 페이지 로드 시 기본 데이터 호출
fetchBoardData('', '', currentPage);
