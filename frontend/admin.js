/**
 * 사용자 관리 페이지 스크립트
 */

let users = [];
let currentUserId = null;
let deleteUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 관리자 권한 확인
    const isAuthorized = await requireAdmin();
    if (!isAuthorized) return;

    // 사용자 목록 로드
    await loadUsers();

    // 폼 이벤트 등록
    document.getElementById('user-form').addEventListener('submit', handleUserSubmit);
    document.getElementById('password-form').addEventListener('submit', handlePasswordSubmit);
});

/**
 * 사용자 목록 로드
 */
async function loadUsers() {
    try {
        const response = await authFetch('/api/users');
        const result = await response.json();

        if (result.success) {
            users = result.data;
            renderUsers();
        } else {
            showMessage(result.message || '사용자 목록을 불러올 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('사용자 목록 로드 오류:', error);
        showMessage('사용자 목록을 불러오는 중 오류가 발생했습니다', 'error');
    }
}

/**
 * 사용자 목록 렌더링
 */
function renderUsers() {
    const container = document.getElementById('users-container');

    if (users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>등록된 사용자가 없습니다</h3>
                <p>새 사용자를 추가해주세요</p>
            </div>
        `;
        return;
    }

    const currentUser = TokenManager.getUser();

    container.innerHTML = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>이메일</th>
                    <th>이름</th>
                    <th>역할</th>
                    <th>상태</th>
                    <th>마지막 로그인</th>
                    <th>가입일</th>
                    <th>관리</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${escapeHtml(user.email)}</td>
                        <td>${escapeHtml(user.name)}</td>
                        <td>
                            <span class="role-badge role-${user.role}">
                                ${user.role === 'admin' ? '관리자' : '사용자'}
                            </span>
                        </td>
                        <td>
                            <span class="status-badge status-${user.is_active ? 'active' : 'inactive'}">
                                ${user.is_active ? '활성' : '비활성'}
                            </span>
                        </td>
                        <td>${user.last_login_at ? formatDate(user.last_login_at) : '-'}</td>
                        <td>${formatDate(user.created_at)}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-secondary btn-small" onclick="openEditModal(${user.id})">수정</button>
                                <button class="btn btn-secondary btn-small" onclick="openPasswordModal(${user.id})">비밀번호</button>
                                ${user.id !== currentUser.id ? `
                                    <button class="btn btn-danger btn-small" onclick="openDeleteModal(${user.id}, '${escapeHtml(user.email)}')">삭제</button>
                                ` : ''}
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * 사용자 생성 모달 열기
 */
function openCreateModal() {
    currentUserId = null;
    document.getElementById('modal-title').textContent = '새 사용자';
    document.getElementById('user-id').value = '';
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-name').value = '';
    document.getElementById('user-role').value = 'user';
    document.getElementById('user-active').value = 'true';

    // 비밀번호 필수
    document.getElementById('user-password').required = true;
    document.getElementById('password-group').style.display = 'block';
    document.getElementById('active-group').style.display = 'none';

    document.getElementById('user-modal').classList.add('show');
}

/**
 * 사용자 수정 모달 열기
 */
function openEditModal(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    currentUserId = userId;
    document.getElementById('modal-title').textContent = '사용자 수정';
    document.getElementById('user-id').value = user.id;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-password').value = '';
    document.getElementById('user-name').value = user.name;
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-active').value = user.is_active ? 'true' : 'false';

    // 수정 시 비밀번호 비필수, 상태 표시
    document.getElementById('user-password').required = false;
    document.getElementById('password-group').style.display = 'none';
    document.getElementById('active-group').style.display = 'block';

    document.getElementById('user-modal').classList.add('show');
}

/**
 * 모달 닫기
 */
function closeModal() {
    document.getElementById('user-modal').classList.remove('show');
    currentUserId = null;
}

/**
 * 사용자 폼 제출 처리
 */
async function handleUserSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('user-email').value.trim();
    const password = document.getElementById('user-password').value;
    const name = document.getElementById('user-name').value.trim();
    const role = document.getElementById('user-role').value;
    const isActive = document.getElementById('user-active').value === 'true';

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';

    try {
        let response;

        if (currentUserId) {
            // 수정
            response = await authFetch(`/api/users/${currentUserId}`, {
                method: 'PUT',
                body: JSON.stringify({ email, name, role, is_active: isActive }),
            });
        } else {
            // 생성
            if (!password || password.length < 6) {
                showMessage('비밀번호는 6자 이상이어야 합니다', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = '저장';
                return;
            }

            response = await authFetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({ email, password, name, role }),
            });
        }

        const result = await response.json();

        if (result.success) {
            showMessage(currentUserId ? '사용자가 수정되었습니다' : '사용자가 생성되었습니다', 'success');
            closeModal();
            await loadUsers();
        } else {
            showMessage(result.message || '저장에 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('사용자 저장 오류:', error);
        showMessage('저장 중 오류가 발생했습니다', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '저장';
    }
}

/**
 * 비밀번호 재설정 모달 열기
 */
function openPasswordModal(userId) {
    document.getElementById('password-user-id').value = userId;
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    document.getElementById('password-modal').classList.add('show');
}

/**
 * 비밀번호 모달 닫기
 */
function closePasswordModal() {
    document.getElementById('password-modal').classList.remove('show');
}

/**
 * 비밀번호 변경 폼 제출
 */
async function handlePasswordSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('password-user-id').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword.length < 6) {
        showMessage('비밀번호는 6자 이상이어야 합니다', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('비밀번호가 일치하지 않습니다', 'error');
        return;
    }

    try {
        const response = await authFetch(`/api/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword }),
        });

        const result = await response.json();

        if (result.success) {
            showMessage('비밀번호가 변경되었습니다', 'success');
            closePasswordModal();
        } else {
            showMessage(result.message || '비밀번호 변경에 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('비밀번호 변경 오류:', error);
        showMessage('비밀번호 변경 중 오류가 발생했습니다', 'error');
    }
}

/**
 * 삭제 확인 모달 열기
 */
function openDeleteModal(userId, email) {
    deleteUserId = userId;
    document.getElementById('delete-message').textContent = `정말로 "${email}" 사용자를 삭제하시겠습니까? 이 사용자의 메모는 소유자 없음 상태가 됩니다.`;
    document.getElementById('delete-modal').classList.add('show');

    document.getElementById('confirm-delete-btn').onclick = () => confirmDelete();
}

/**
 * 삭제 모달 닫기
 */
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('show');
    deleteUserId = null;
}

/**
 * 사용자 삭제 확인
 */
async function confirmDelete() {
    if (!deleteUserId) return;

    try {
        const response = await authFetch(`/api/users/${deleteUserId}`, {
            method: 'DELETE',
        });

        const result = await response.json();

        if (result.success) {
            showMessage('사용자가 삭제되었습니다', 'success');
            closeDeleteModal();
            await loadUsers();
        } else {
            showMessage(result.message || '삭제에 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('사용자 삭제 오류:', error);
        showMessage('삭제 중 오류가 발생했습니다', 'error');
    }
}

/**
 * 메모 페이지로 이동
 */
function goToMemos() {
    window.location.href = '/';
}

/**
 * 메시지 표시
 */
function showMessage(text, type) {
    const message = document.getElementById('message');
    message.textContent = text;
    message.className = `message show ${type}`;

    setTimeout(() => {
        message.classList.remove('show');
    }, 5000);
}

/**
 * HTML 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
