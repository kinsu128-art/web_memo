// DOM Elements
const notesList = document.getElementById('notesList');
const editorContent = document.getElementById('editorContent');
const emptyState = document.getElementById('emptyState');
const memoTitle = document.getElementById('memoTitle');
const memoContent = document.getElementById('memoContent');
const memoDate = document.getElementById('memoDate');
const memoReadTime = document.getElementById('memoReadTime');
const saveStatus = document.getElementById('saveStatus');
const saveText = document.getElementById('saveText');
const deleteBtn = document.getElementById('deleteBtn');
const deleteModal = document.getElementById('deleteModal');
const searchInput = document.getElementById('searchInput');

// State
let allNotes = [];
let filteredNotes = [];
let currentNoteId = null;
let saveTimeout = null;

// Initialize
document.addEventListener('DOMContentLoaded', loadMemos);

// Load all memos from API
async function loadMemos() {
    try {
        const response = await fetch('/api/memos');
        const result = await response.json();

        if (result.success) {
            allNotes = result.data || [];
            filteredNotes = allNotes;
            renderNotesList();

            // Show empty state if no current note is selected and no notes exist
            if (allNotes.length === 0 && !currentNoteId) {
                showEmptyState();
            }
        } else {
            console.error('❌ API 응답 오류:', result);
            showNotification('메모를 불러올 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
        showNotification('메모를 불러올 수 없습니다', 'error');
        showEmptyState();
    }
}

// Render notes list
function renderNotesList() {
    notesList.innerHTML = '';

    if (filteredNotes.length === 0) {
        if (searchInput.value.trim()) {
            notesList.innerHTML = '<div class="text-center text-[#506795] py-8">검색 결과가 없습니다</div>';
        } else {
            notesList.innerHTML = '<div class="text-center text-[#506795] py-8">메모가 없습니다</div>';
        }
        return;
    }

    filteredNotes.forEach(note => {
        const noteElement = createNoteElement(note);
        notesList.appendChild(noteElement);
    });
}

// Create note list item element
function createNoteElement(note) {
    const div = document.createElement('div');
    const isActive = currentNoteId === note.id;

    div.className = `group cursor-pointer p-4 rounded-xl transition-all border ${
        isActive
            ? 'bg-primary/10 border-primary/10'
            : 'hover:bg-[#e8ebf3] dark:hover:bg-[#1f2937] border-transparent'
    }`;

    const date = new Date(note.updated_at);
    const dateStr = formatNoteDate(date);

    div.innerHTML = `
        <div class="flex justify-between items-start mb-1">
            <h3 class="text-[#0e121b] dark:text-white text-base font-semibold leading-tight line-clamp-1">${escapeHtml(note.title)}</h3>
            <span class="text-[11px] text-[#506795] font-medium shrink-0">${dateStr}</span>
        </div>
        <p class="text-[#506795] text-sm leading-relaxed line-clamp-2">${escapeHtml(note.content)}</p>
    `;

    div.onclick = () => selectNote(note.id);
    return div;
}

// Select and open a note
async function selectNote(id) {
    try {
        const response = await fetch(`/api/memos/${id}`);
        const result = await response.json();

        if (result.success) {
            currentNoteId = id;
            const note = result.data;

            memoTitle.value = note.title;
            memoContent.value = note.content;

            // Update date
            const date = new Date(note.updated_at);
            memoDate.textContent = formatFullDate(date);

            // Update read time
            updateReadTime();

            // Show editor
            showEditor();

            // Update list styling
            renderNotesList();
            deleteBtn.style.display = 'block';
        }
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
    }
}

// Create new note
function createNewNote() {
    currentNoteId = null;
    memoTitle.value = '';
    memoContent.value = '';
    memoDate.textContent = new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    memoReadTime.textContent = '0분 읽기';
    showEditor();
    memoTitle.focus();
    deleteBtn.style.display = 'none';
    renderNotesList();
}

// Update current note
async function updateCurrentNote() {
    const title = memoTitle.value.trim();
    const content = memoContent.value.trim();

    if (!title || !content) {
        return;
    }

    // Show saving status
    saveStatus.innerText = 'schedule';
    saveText.textContent = '저장 중...';

    // Clear previous timeout
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // Auto-save after 1 second
    saveTimeout = setTimeout(async () => {
        try {
            let response;

            if (currentNoteId) {
                // Update existing note
                response = await fetch(`/api/memos/${currentNoteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
            } else {
                // Create new note
                response = await fetch('/api/memos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, content })
                });
            }

            const result = await response.json();

            if (result.success) {
                if (!currentNoteId && result.data.id) {
                    currentNoteId = result.data.id;
                    deleteBtn.style.display = 'block';
                    memoDate.textContent = new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }

                // Update save status
                saveStatus.innerText = 'cloud_done';
                saveText.textContent = '저장됨';

                // Reload notes list
                loadMemos();
            } else {
                // Save failed
                saveStatus.innerText = 'cloud_off';
                saveText.textContent = '저장 실패';
                showNotification('저장에 실패했습니다', 'error');
            }
        } catch (error) {
            console.error('❌ 저장 실패:', error);
            saveStatus.innerText = 'cloud_off';
            saveText.textContent = '저장 실패';
            showNotification('메모 저장 중 오류가 발생했습니다', 'error');
        }
    }, 1000);
}

// Update read time
function updateReadTime() {
    const content = memoContent.value;
    const wordCount = content.trim().split(/\s+/).length;
    const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
    memoReadTime.textContent = `${readMinutes}분 읽기`;
}

// Handle search
function handleSearch(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
        filteredNotes = allNotes;
    } else {
        filteredNotes = allNotes.filter(note =>
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term)
        );
    }

    renderNotesList();
}

// Open delete modal
function openDeleteModal() {
    if (currentNoteId) {
        deleteModal.style.display = 'flex';
    }
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
}

// Confirm delete
async function confirmDelete() {
    if (!currentNoteId) return;

    try {
        const response = await fetch(`/api/memos/${currentNoteId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (result.success) {
            closeDeleteModal();
            showNotification('메모가 삭제되었습니다');
            loadMemos();
            showEmptyState();
            deleteBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ 삭제 실패:', error);
        showNotification('메모 삭제에 실패했습니다', 'error');
    }
}

// Show editor
function showEditor() {
    emptyState.style.display = 'none';
    editorContent.style.display = 'flex';
}

// Show empty state
function showEmptyState() {
    emptyState.style.display = 'flex';
    editorContent.style.display = 'none';
    deleteBtn.style.display = 'none';
}

// Toggle dark mode
function toggleDarkMode() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
}

// Load theme preference
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    const html = document.documentElement;

    if (theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
}

// Format date for note list
function formatNoteDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
    });
}

// Format full date
function formatFullDate(date) {
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-3 rounded-lg text-white font-medium z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-primary'
    }`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Escape HTML special characters
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Load theme on startup
loadTheme();
