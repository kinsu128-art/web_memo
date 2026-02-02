// =====================
// API 설정
// =====================

const API_URL = '/api/memos';

// =====================
// 상태 관리
// =====================

let currentMemoId = null;
let memos = [];

// =====================
// DOM 요소
// =====================

const memoList = document.getElementById('memoList');
const memoForm = document.getElementById('memoForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const clearBtn = document.getElementById('clearBtn');
const refreshBtn = document.getElementById('refreshBtn');
const detailTitle = document.getElementById('detailTitle');
const messageDiv = document.getElementById('message');
const titleCount = document.getElementById('titleCount');
const contentCount = document.getElementById('contentCount');
const confirmDialog = document.getElementById('confirmDialog');
const confirmBtn = document.getElementById('confirmBtn');
const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
const confirmMessage = document.getElementById('confirmMessage');
const memoItemTemplate = document.getElementById('memoItemTemplate');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');

// =====================
// 초기화
// =====================

document.addEventListener('DOMContentLoaded', () => {
    loadMemos();
    setupEventListeners();
});

// =====================
// 이벤트 리스너 설정
// =====================

function setupEventListeners() {
    // 폼 이벤트
    memoForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    clearBtn.addEventListener('click', handleClear);

    // 새로고침 버튼
    refreshBtn.addEventListener('click', loadMemos);

    // 입력 필드 이벤트
    titleInput.addEventListener('input', updateTitleCount);
    contentInput.addEventListener('input', updateContentCount);

    // 검색 이벤트
    searchInput.addEventListener('input', handleSearch);
    searchClearBtn.addEventListener('click', clearSearch);

    // 확인 다이얼로그
    confirmBtn.addEventListener('click', handleConfirmDelete);
    cancelConfirmBtn.addEventListener('click', closeConfirmDialog);

    // 엔터 키로 새로운 메모 생성 (Ctrl+Enter)
    contentInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            memoForm.dispatchEvent(new Event('submit'));
        }
    });
}

// =====================
// API 함수
// =====================

/**
 * 모든 메모 조회
 */
async function loadMemos() {
    try {
        memoList.innerHTML = '<div class="loading">로딩 중...</div>';
        const response = await fetch(API_URL);
        const result = await response.json();

        if (result.success) {
            memos = result.data;
            renderMemoList();
        } else {
            showMessage('메모를 불러올 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
        memoList.innerHTML = '<div class="loading" style="color: #ff6b6b;">메모를 불러올 수 없습니다</div>';
        showMessage('서버에 연결할 수 없습니다', 'error');
    }
}

/**
 * 메모 생성
 */
async function createMemo(title, content) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        const result = await response.json();

        if (result.success) {
            showMessage('메모가 생성되었습니다', 'success');
            resetForm();
            await loadMemos();
        } else {
            showMessage(result.message || '메모를 생성할 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 생성 실패:', error);
        showMessage('서버에 연결할 수 없습니다', 'error');
    }
}

/**
 * 메모 수정
 */
async function updateMemo(id, title, content) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, content }),
        });

        const result = await response.json();

        if (result.success) {
            showMessage('메모가 수정되었습니다', 'success');
            currentMemoId = null;
            resetForm();
            await loadMemos();
        } else {
            showMessage(result.message || '메모를 수정할 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 수정 실패:', error);
        showMessage('서버에 연결할 수 없습니다', 'error');
    }
}

/**
 * 메모 삭제
 */
async function deleteMemo(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            showMessage('메모가 삭제되었습니다', 'success');
            currentMemoId = null;
            resetForm();
            await loadMemos();
        } else {
            showMessage(result.message || '메모를 삭제할 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 삭제 실패:', error);
        showMessage('서버에 연결할 수 없습니다', 'error');
    }
}

/**
 * 메모 상세 조회
 */
function getMemoById(id) {
    return memos.find(memo => memo.id === id);
}

// =====================
// UI 렌더링
// =====================

/**
 * 메모 목록 렌더링
 */
function renderMemoList() {
    if (memos.length === 0) {
        memoList.innerHTML = '<div class="loading" style="padding: 60px 20px; color: #999;">메모가 없습니다. 새로 작성해보세요!</div>';
        return;
    }

    memoList.innerHTML = '';

    memos.forEach(memo => {
        const item = memoItemTemplate.content.cloneNode(true);
        const memoItemDiv = item.querySelector('.memo-item');
        const titleElement = item.querySelector('.memo-title');
        const previewElement = item.querySelector('.memo-preview');
        const dateElement = item.querySelector('.memo-date');
        const editBtn = item.querySelector('.btn-edit');
        const deleteBtn = item.querySelector('.btn-delete');

        memoItemDiv.dataset.id = memo.id;
        titleElement.textContent = memo.title;
        previewElement.textContent = memo.content.substring(0, 50) + (memo.content.length > 50 ? '...' : '');
        dateElement.textContent = formatDate(memo.updated_at);

        // 클릭 이벤트
        memoItemDiv.addEventListener('click', () => selectMemo(memo.id));

        // 수정 버튼
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectMemo(memo.id);
        });

        // 삭제 버튼
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openConfirmDialog(memo.id, memo.title);
        });

        memoList.appendChild(item);
    });

    // 현재 선택된 메모 강조
    if (currentMemoId) {
        const activeItem = memoList.querySelector(`[data-id="${currentMemoId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

/**
 * 메모 선택 및 편집
 */
function selectMemo(id) {
    const memo = getMemoById(id);
    if (!memo) return;

    currentMemoId = id;
    titleInput.value = memo.title;
    contentInput.value = memo.content;
    detailTitle.textContent = `메모 편집: ${memo.title}`;
    submitBtn.textContent = '수정';
    cancelBtn.style.display = 'inline-flex';
    clearBtn.style.display = 'inline-flex';

    updateTitleCount();
    updateContentCount();
    renderMemoList();

    // 스크롤
    if (window.innerWidth <= 768) {
        memoForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// =====================
// 폼 처리
// =====================

/**
 * 폼 제출
 */
function handleFormSubmit(e) {
    e.preventDefault();

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        showMessage('제목과 내용을 입력해주세요', 'error');
        return;
    }

    if (currentMemoId) {
        updateMemo(currentMemoId, title, content);
    } else {
        createMemo(title, content);
    }
}

/**
 * 폼 취소
 */
function handleCancel() {
    currentMemoId = null;
    resetForm();
}

/**
 * 폼 초기화
 */
function handleClear() {
    if (confirm('작성 중인 내용을 모두 삭제하시겠습니까?')) {
        currentMemoId = null;
        resetForm();
    }
}

/**
 * 폼 리셋
 */
function resetForm() {
    memoForm.reset();
    titleInput.value = '';
    contentInput.value = '';
    currentMemoId = null;
    detailTitle.textContent = '새 메모 작성';
    submitBtn.textContent = '저장';
    cancelBtn.style.display = 'none';
    clearBtn.style.display = 'none';
    updateTitleCount();
    updateContentCount();
    renderMemoList();
    messageDiv.innerHTML = '';
}

// =====================
// 입력 필드 카운팅
// =====================

/**
 * 제목 글자 수 업데이트
 */
function updateTitleCount() {
    const count = titleInput.value.length;
    titleCount.textContent = `${count}/255`;
}

/**
 * 내용 글자 수 업데이트
 */
function updateContentCount() {
    const count = contentInput.value.length;
    contentCount.textContent = `${count}자`;
}

// =====================
// 메시지 표시
// =====================

/**
 * 메시지 표시
 */
function showMessage(text, type = 'info') {
    messageDiv.textContent = text;
    messageDiv.className = `message show ${type}`;

    // 3초 후 자동 사라짐
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, 3000);
}

// =====================
// 확인 다이얼로그
// =====================

let deleteTargetId = null;

/**
 * 확인 다이얼로그 열기
 */
function openConfirmDialog(id, title) {
    deleteTargetId = id;
    confirmMessage.textContent = `"${title}" 메모를 삭제하시겠습니까?`;
    confirmDialog.style.display = 'flex';
}

/**
 * 확인 다이얼로그 닫기
 */
function closeConfirmDialog() {
    confirmDialog.style.display = 'none';
    deleteTargetId = null;
}

/**
 * 삭제 확인
 */
function handleConfirmDelete() {
    if (deleteTargetId) {
        deleteMemo(deleteTargetId);
        closeConfirmDialog();
    }
}

// 다이얼로그 외부 영역 클릭으로 닫기
confirmDialog.addEventListener('click', (e) => {
    if (e.target === confirmDialog) {
        closeConfirmDialog();
    }
});

// =====================
// 유틸리티 함수
// =====================

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
        return '방금 전';
    } else if (diffMins < 60) {
        return `${diffMins}분 전`;
    } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}

// =====================
// 검색 기능
// =====================

/**
 * 메모 검색
 */
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // 검색 초기화 버튼 표시/숨김
    if (searchTerm.length > 0) {
        searchClearBtn.style.display = 'inline-flex';
    } else {
        searchClearBtn.style.display = 'none';
    }

    // 검색 결과 필터링
    if (searchTerm.length === 0) {
        renderMemoList(); // 원본 목록 표시
    } else {
        const filteredMemos = memos.filter(memo => {
            const title = memo.title.toLowerCase();
            const content = memo.content.toLowerCase();
            return title.includes(searchTerm) || content.includes(searchTerm);
        });

        renderFilteredMemoList(filteredMemos);
    }
}

/**
 * 검색 초기화
 */
function clearSearch() {
    searchInput.value = '';
    searchClearBtn.style.display = 'none';
    renderMemoList();
    searchInput.focus();
}

/**
 * 필터링된 메모 목록 렌더링
 */
function renderFilteredMemoList(filteredMemos) {
    if (filteredMemos.length === 0) {
        memoList.innerHTML = '<div class="loading" style="padding: 60px 20px; color: #999;">검색 결과가 없습니다.</div>';
        return;
    }

    memoList.innerHTML = '';

    filteredMemos.forEach(memo => {
        const item = memoItemTemplate.content.cloneNode(true);
        const memoItemDiv = item.querySelector('.memo-item');
        const titleElement = item.querySelector('.memo-title');
        const previewElement = item.querySelector('.memo-preview');
        const dateElement = item.querySelector('.memo-date');
        const editBtn = item.querySelector('.btn-edit');
        const deleteBtn = item.querySelector('.btn-delete');

        memoItemDiv.dataset.id = memo.id;
        titleElement.textContent = memo.title;
        previewElement.textContent = memo.content.substring(0, 50) + (memo.content.length > 50 ? '...' : '');
        dateElement.textContent = formatDate(memo.updated_at);

        // 클릭 이벤트
        memoItemDiv.addEventListener('click', () => selectMemo(memo.id));

        // 수정 버튼
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectMemo(memo.id);
        });

        // 삭제 버튼
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openConfirmDialog(memo.id, memo.title);
        });

        memoList.appendChild(item);
    });

    // 현재 선택된 메모 강조
    if (currentMemoId) {
        const activeItem = memoList.querySelector(`[data-id="${currentMemoId}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
}

// =====================
// 접근성 개선
// =====================

// Enter 키로 메모 항목 선택
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (currentMemoId) {
            handleCancel();
        }
    }
});
