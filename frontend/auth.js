/**
 * 인증 관련 유틸리티 클래스
 */
class TokenManager {
    static TOKEN_KEY = 'memo_token';
    static USER_KEY = 'memo_user';

    /**
     * 토큰 저장
     * @param {string} token - JWT 토큰
     */
    static setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    /**
     * 토큰 가져오기
     * @returns {string|null} JWT 토큰
     */
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * 토큰 삭제
     */
    static removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    /**
     * 사용자 정보 저장
     * @param {Object} user - 사용자 정보
     */
    static setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * 사용자 정보 가져오기
     * @returns {Object|null} 사용자 정보
     */
    static getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    /**
     * 사용자 정보 삭제
     */
    static removeUser() {
        localStorage.removeItem(this.USER_KEY);
    }

    /**
     * 모든 인증 정보 삭제
     */
    static clear() {
        this.removeToken();
        this.removeUser();
    }

    /**
     * 토큰 존재 여부 확인
     * @returns {boolean}
     */
    static hasToken() {
        return !!this.getToken();
    }
}

/**
 * 인증 헤더가 포함된 fetch 래퍼
 * @param {string} url - 요청 URL
 * @param {Object} options - fetch 옵션
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
    const token = TokenManager.getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // 401 에러 시 로그인 페이지로 이동
    if (response.status === 401) {
        TokenManager.clear();
        window.location.href = '/login.html';
        return;
    }

    return response;
}

/**
 * 로그인 처리
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} 로그인 결과
 */
async function login(email, password) {
    try {
        console.log('📨 [login] 요청 시작:', { email, password: '***' });

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        console.log('📨 [login] 응답 상태:', response.status, response.statusText);
        console.log('📨 [login] 응답 헤더:', Object.fromEntries(response.headers.entries()));

        // HTTP 에러 상태 확인
        if (!response.ok) {
            console.error('📨 [login] HTTP 에러:', response.status);
            const errorData = await response.json().catch(() => ({ message: '알 수 없는 에러' }));
            console.error('📨 [login] 에러 데이터:', errorData);
            return {
                success: false,
                message: errorData.message || `HTTP ${response.status} 에러`,
            };
        }

        const result = await response.json();
        console.log('📨 [login] 응답 데이터:', result);

        if (result.success) {
            TokenManager.setToken(result.data.token);
            TokenManager.setUser(result.data.user);
            console.log('✅ [login] 로그인 성공');
        } else {
            console.log('❌ [login] 로그인 실패:', result.message);
        }

        return result;
    } catch (error) {
        console.error('❌ [login] 네트워크/파싱 에러:', error);
        console.error('❌ [login] 에러 메시지:', error.message);
        console.error('❌ [login] 에러 스택:', error.stack);
        return {
            success: false,
            message: `로그인 오류: ${error.message}`,
        };
    }
}

/**
 * 로그아웃 처리
 */
async function logout() {
    try {
        await authFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('로그아웃 오류:', error);
    } finally {
        TokenManager.clear();
        window.location.href = '/login.html';
    }
}

/**
 * 인증 상태 확인
 * @returns {Promise<boolean>} 인증 여부
 */
async function checkAuth() {
    if (!TokenManager.hasToken()) {
        return false;
    }

    try {
        const response = await authFetch('/api/auth/me');
        if (!response) return false;

        const result = await response.json();

        if (result.success) {
            TokenManager.setUser(result.data);
            return true;
        }

        TokenManager.clear();
        return false;
    } catch (error) {
        console.error('인증 확인 오류:', error);
        TokenManager.clear();
        return false;
    }
}

/**
 * 관리자 여부 확인
 * @returns {boolean}
 */
function isAdmin() {
    const user = TokenManager.getUser();
    return user && user.role === 'admin';
}

/**
 * 인증 필요 페이지 보호
 */
async function requireAuth() {
    const isAuthenticated = await checkAuth();
    if (!isAuthenticated) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

/**
 * 관리자 페이지 보호
 */
async function requireAdmin() {
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) return false;

    if (!isAdmin()) {
        alert('관리자 권한이 필요합니다');
        window.location.href = '/';
        return false;
    }
    return true;
}
