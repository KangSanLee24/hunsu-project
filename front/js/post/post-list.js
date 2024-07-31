import { API_BASE_URL } from '../../config/config.js';

const boardListElement = document.getElementById('board-list');
const categorySelect = document.getElementById('category-select');
const sortSelect = document.getElementById('sort-select');
const filterButton = document.getElementById('filter-button');
const pageNumbersElement = document.getElementById('page-numbers');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const currentPageLabel = document.getElementById('current-page-label');
// const keywordInput = document.getElementById('keyword-input'); // 검색어 입력란

let currentPage = 1; // 현재 페이지
let totalPages = 0; // 총 페이지 수
const postsPerPage = 20; // 페이지 당 게시글 수

// API 호출 함수
async function fetchBoardData(category, sort, page) {
  // async function fetchBoardData(category, sort, page, keyword) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts?category=${category}&sort=${sort}&page=${page}&limit=${postsPerPage}}`
    );
    // const response = await fetch(
    //   `${API_BASE_URL}/posts?category=${category}&sort=${sort}&page=${page}&limit=${postsPerPage}&keyword=${encodeURIComponent(keyword)}`
    // );
    const result = await response.json();

    if (result.statusCode === 200) {
      renderBoardList(result.data);
      totalPages = result.totalPages; // 총 페이지 수 업데이트
      updatePagination();
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
            <td><a href="post-detail.html?id=${item.id}">${item.title}</a></td>
            <td>${item.nickname}</td>
            <td>${new Date(item.createdAt).toLocaleString()}</td>
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
    pageButton.addEventListener('click', () => {
      currentPage = i;
      fetchBoardData(categorySelect.value, sortSelect.value, currentPage);
    });
    pageNumbersElement.appendChild(pageButton);
  }
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  currentPageLabel.textContent = `현재 페이지: ${currentPage}`;
}

// 필터 버튼 클릭 시 API 호출
filterButton.addEventListener('click', () => {
  currentPage = 1; // 검색 시 첫 페이지로 초기화
  fetchBoardData(categorySelect.value, sortSelect.value, currentPage);
});

// 페이지 이동 버튼 클릭 이벤트
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    fetchBoardData(categorySelect.value, sortSelect.value, currentPage);
  }
});

nextButton.addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    fetchBoardData(categorySelect.value, sortSelect.value, currentPage);
  }
});

// 페이지 로드 시 기본 데이터 호출
fetchBoardData('', '', currentPage);
