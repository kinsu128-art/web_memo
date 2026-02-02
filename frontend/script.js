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
let filterMode = 'all'; // 'all' 또는 'favorites'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 페이지 로드됨');
    console.log('API URL: /api/memos');
    loadMemos();
});

// Load all memos from API
async function loadMemos() {
    try {
        console.log('📥 메모 로드 시작...');
        const response = await fetch('/api/memos');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📦 API 응답:', result);

        if (result.success && Array.isArray(result.data)) {
            allNotes = result.data;
            filteredNotes = allNotes;
            console.log(`✅ ${allNotes.length}개의 메모 로드됨`);
            renderNotesList();

            // Show empty state if no current note is selected and no notes exist
            if (allNotes.length === 0 && !currentNoteId) {
                showEmptyState();
            }
        } else {
            console.error('❌ API 응답 형식 오류:', result);
            allNotes = [];
            filteredNotes = [];
            renderNotesList();
            showEmptyState();
            showNotification('메모를 불러올 수 없습니다', 'error');
        }
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
        allNotes = [];
        filteredNotes = [];
        renderNotesList();
        showEmptyState();
        showNotification(`메모 로드 실패: ${error.message}`, 'error');
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
    const favoriteIcon = note.is_favorite ? '★' : '☆';
    const favoriteColor = note.is_favorite ? 'text-yellow-400' : 'text-[#506795]';

    div.innerHTML = `
        <div class="flex justify-between items-start mb-1">
            <h3 class="text-[#0e121b] dark:text-white text-base font-semibold leading-tight line-clamp-1 flex-1">${escapeHtml(note.title)}</h3>
            <div class="flex items-center gap-2 shrink-0">
                <button class="text-lg ${favoriteColor} hover:text-yellow-400 transition-colors" onclick="event.stopPropagation(); toggleFavorite(${note.id})" title="즐겨찾기">${favoriteIcon}</button>
                <span class="text-[11px] text-[#506795] font-medium">${dateStr}</span>
            </div>
        </div>
        <p class="text-[#506795] text-sm leading-relaxed line-clamp-2">${escapeHtml(note.content)}</p>
    `;

    div.onclick = () => selectNote(note.id);
    return div;
}

// Select and open a note
async function selectNote(id) {
    try {
        console.log(`📖 메모 로드 중: ${id}`);
        const response = await fetch(`/api/memos/${id}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📦 메모 응답:', result);

        if (result.success && result.data) {
            currentNoteId = id;
            const note = result.data;

            memoTitle.value = note.title || '';
            memoContent.value = note.content || '';

            // Update date
            const date = new Date(note.updated_at || note.created_at);
            memoDate.textContent = formatFullDate(date);

            // Update read time
            updateReadTime();

            // Show editor
            showEditor();

            // Update list styling
            renderNotesList();
            deleteBtn.style.display = 'block';
            console.log(`✅ 메모 로드 완료: ${note.title}`);
        } else {
            throw new Error('API 응답 형식 오류');
        }
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
        showNotification(`메모 로드 실패: ${error.message}`, 'error');
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
            const isNewNote = !currentNoteId;
            const method = isNewNote ? 'POST' : 'PUT';
            const url = isNewNote ? '/api/memos' : `/api/memos/${currentNoteId}`;

            console.log(`💾 메모 저장: ${isNewNote ? '새로 생성' : '수정'} - ${url}`);

            response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('💾 저장 응답:', result);

            if (result.success && result.data) {
                if (isNewNote && result.data.id) {
                    currentNoteId = result.data.id;
                    deleteBtn.style.display = 'block';
                    memoDate.textContent = new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    console.log(`✅ 새 메모 생성됨: ID ${currentNoteId}`);
                } else if (!isNewNote) {
                    console.log(`✅ 메모 수정됨: ID ${currentNoteId}`);
                }

                // Update save status
                saveStatus.innerText = 'cloud_done';
                saveText.textContent = '저장됨';

                // Reload notes list
                loadMemos();
            } else {
                throw new Error(result.error || '저장에 실패했습니다');
            }
        } catch (error) {
            console.error('❌ 저장 실패:', error);
            saveStatus.innerText = 'cloud_off';
            saveText.textContent = '저장 실패';
            showNotification(`메모 저장 실패: ${error.message}`, 'error');
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
        // Apply filter mode
        if (filterMode === 'favorites') {
            filteredNotes = allNotes.filter(note => note.is_favorite);
        } else {
            filteredNotes = allNotes;
        }
    } else {
        let notes = filterMode === 'favorites'
            ? allNotes.filter(note => note.is_favorite)
            : allNotes;

        filteredNotes = notes.filter(note =>
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term)
        );
    }

    renderNotesList();
}

// Toggle favorite
async function toggleFavorite(id) {
    try {
        console.log(`⭐ 즐겨찾기 토글: ${id}`);
        const response = await fetch(`/api/memos/${id}/favorite`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('⭐ 즐겨찾기 응답:', result);

        if (result.success && result.data) {
            // Update note in allNotes
            const index = allNotes.findIndex(n => n.id === id);
            if (index !== -1) {
                allNotes[index] = result.data;
            }

            // Update filtered notes
            const filteredIndex = filteredNotes.findIndex(n => n.id === id);
            if (filteredIndex !== -1) {
                filteredNotes[filteredIndex] = result.data;
            }

            // Re-render list
            renderNotesList();

            // Show message
            showNotification(result.message);
            console.log(`✅ 즐겨찾기 토글 완료`);
        } else {
            throw new Error(result.error || '즐겨찾기 토글 실패');
        }
    } catch (error) {
        console.error('❌ 즐겨찾기 토글 실패:', error);
        showNotification(`즐겨찾기 토글 실패: ${error.message}`, 'error');
    }
}

// Load favorites
async function loadFavorites() {
    try {
        console.log('⭐ 즐겨찾기 목록 로드');
        filterMode = 'favorites';

        // Filter locally first
        filteredNotes = allNotes.filter(note => note.is_favorite);
        renderNotesList();

        // Show message
        showNotification(`${filteredNotes.length}개의 즐겨찾기`);
    } catch (error) {
        console.error('❌ 즐겨찾기 로드 실패:', error);
        showNotification('즐겨찾기를 불러올 수 없습니다', 'error');
    }
}

// Load all notes (reset filter)
function loadAllNotes() {
    try {
        console.log('📝 모든 메모 로드');
        filterMode = 'all';
        filteredNotes = allNotes;
        renderNotesList();
        searchInput.value = '';
    } catch (error) {
        console.error('❌ 메모 로드 실패:', error);
        showNotification('메모를 불러올 수 없습니다', 'error');
    }
}

// Load trash (recently deleted memos)
function loadTrash() {
    try {
        console.log('🗑️ 휴지통 로드');
        showNotification('휴지통은 삭제된 메모를 보여줍니다.\n메모를 삭제하면 여기에 나타납니다.\n\n현재 삭제된 메모가 없습니다.', 'error');
    } catch (error) {
        console.error('❌ 휴지통 로드 실패:', error);
        showNotification('휴지통을 불러올 수 없습니다', 'error');
    }
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

// Text formatting functions
function applyFormat(format) {
    if (!memoContent) {
        console.error('❌ memoContent 요소를 찾을 수 없습니다');
        showNotification('에디터가 준비되지 않았습니다', 'error');
        return;
    }

    const textarea = memoContent;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText && format !== 'insertUnorderedList' && format !== 'insertOrderedList') {
        showNotification('텍스트를 선택해주세요', 'error');
        return;
    }

    let formattedText = selectedText;

    console.log(`📝 포맷팅 적용: ${format}`);

    switch (format) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        case 'strikethrough':
            formattedText = `~~${selectedText}~~`;
            break;
        case 'insertUnorderedList':
            if (selectedText) {
                formattedText = selectedText.split('\n').map(line => `- ${line.trim()}`).filter(l => l !== '-').join('\n');
            } else {
                formattedText = '- 항목';
            }
            break;
        case 'insertOrderedList':
            if (selectedText) {
                formattedText = selectedText.split('\n').map((line, i) => `${i + 1}. ${line.trim()}`).filter(l => !l.match(/^\\d+\\. $/)).join('\n');
            } else {
                formattedText = '1. 항목';
            }
            break;
        default:
            console.warn(`⚠️  알 수 없는 포맷: ${format}`);
            return;
    }

    // Replace selected text
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + formattedText + after;

    console.log(`✅ 포맷팅 완료: ${formattedText.substring(0, 50)}`);

    // Update note
    updateCurrentNote();

    // Restore focus and selection
    textarea.focus();
    const newEnd = start + formattedText.length;
    textarea.setSelectionRange(start, newEnd);
}

function insertCode() {
    if (!memoContent) {
        showNotification('에디터가 준비되지 않았습니다', 'error');
        return;
    }

    const textarea = memoContent;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = textarea.value.substring(start, end);

    const codeBlock = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : '```\n코드를 입력하세요\n```';

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + codeBlock + after;

    console.log('📝 코드 블록 삽입됨');
    updateCurrentNote();
    textarea.focus();
}

function insertQuote() {
    if (!memoContent) {
        showNotification('에디터가 준비되지 않았습니다', 'error');
        return;
    }

    const textarea = memoContent;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = textarea.value.substring(start, end);

    const quoteBlock = selectedText ? selectedText.split('\n').map(line => `> ${line}`).join('\n') : '> 인용구를 입력하세요';

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + quoteBlock + after;

    console.log('📝 인용구 삽입됨');
    updateCurrentNote();
    textarea.focus();
}

function applyColor(color) {
    if (!color) return;

    if (!memoContent) {
        showNotification('에디터가 준비되지 않았습니다', 'error');
        return;
    }

    const textarea = memoContent;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText) {
        showNotification('텍스트를 선택해주세요', 'error');
        return;
    }

    // 간단한 마크다운 스타일 색상 표현
    const coloredText = `[${selectedText}](color:${color})`;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + coloredText + after;

    console.log(`🎨 색상 적용: ${color}`);
    updateCurrentNote();
    textarea.focus();

    // Reset select
    const colorSelect = document.getElementById('textColor');
    if (colorSelect) {
        colorSelect.value = '';
    }
}

function clearFormatting() {
    if (!memoContent) {
        showNotification('에디터가 준비되지 않았습니다', 'error');
        return;
    }

    if (confirm('정말 모든 내용을 삭제하시겠습니까?')) {
        memoContent.value = '';
        updateCurrentNote();
        showNotification('내용이 삭제되었습니다');
        memoContent.focus();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!memoContent) return;

    const isFocused = document.activeElement === memoContent;
    if (!isFocused) return;

    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'b':
                e.preventDefault();
                applyFormat('bold');
                break;
            case 'i':
                e.preventDefault();
                applyFormat('italic');
                break;
            case 'u':
                e.preventDefault();
                applyFormat('underline');
                break;
        }
    }
});

// Load theme on startup
loadTheme();
