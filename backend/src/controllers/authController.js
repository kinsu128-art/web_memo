const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

/**
 * 로그인
 * POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('🔐 로그인 시도:', email);

        // 입력 검증
        if (!email || !password) {
            console.log('❌ 입력 검증 실패: 이메일 또는 비밀번호 누락');
            return res.status(400).json({
                success: false,
                message: '이메일과 비밀번호를 입력해주세요'
            });
        }

        // 사용자 조회
        const user = await User.findByEmail(email);
        console.log('👤 사용자 조회 결과:', user ? `찾음 (${user.email})` : '찾을 수 없음');

        if (user) {
            console.log('👤 사용자 전체 정보:', JSON.stringify(user, null, 2));
            console.log('👤 사용자 password 필드:', user.password);
            console.log('👤 password 타입:', typeof user.password);
            console.log('👤 password 길이:', user.password?.length);
        }

        if (!user) {
            console.log('❌ 사용자를 찾을 수 없음:', email);
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다'
            });
        }

        // 계정 활성화 확인
        console.log('📊 계정 활성화 상태:', user.is_active);
        if (!user.is_active) {
            console.log('❌ 비활성화된 계정');
            return res.status(401).json({
                success: false,
                message: '비활성화된 계정입니다. 관리자에게 문의하세요'
            });
        }

        // 비밀번호 검증
        console.log('🔑 비밀번호 검증 중...');
        console.log('🔑 입력받은 비밀번호:', password);
        console.log('🔑 DB에서 가져온 해시:', user.password);
        const isValid = await User.verifyPassword(password, user.password);
        console.log('🔑 비밀번호 검증 결과:', isValid ? '성공' : '실패');

        if (!isValid) {
            console.log('❌ 비밀번호 불일치');
            return res.status(401).json({
                success: false,
                message: '이메일 또는 비밀번호가 올바르지 않습니다'
            });
        }

        // 마지막 로그인 시간 업데이트
        await User.updateLastLogin(user.id);

        // JWT 토큰 생성
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        console.log(`✅ 로그인 성공: ${user.email}`);

        res.json({
            success: true,
            message: '로그인 성공',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('❌ 로그인 에러:', error.message);
        console.error('에러 상세:', error);
        res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * 로그아웃
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
    // JWT는 stateless이므로 서버에서 할 일이 없음
    // 클라이언트에서 토큰을 삭제하면 됨
    res.json({
        success: true,
        message: '로그아웃 성공'
    });
};

/**
 * 현재 사용자 정보 조회
 * GET /api/auth/me
 */
const me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                last_login_at: user.last_login_at,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('❌ 사용자 정보 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 정보 조회 중 오류가 발생했습니다'
        });
    }
};

/**
 * 비밀번호 변경
 * PUT /api/auth/password
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // 입력 검증
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: '현재 비밀번호와 새 비밀번호를 입력해주세요'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '새 비밀번호는 6자 이상이어야 합니다'
            });
        }

        // 현재 사용자 조회 (비밀번호 포함)
        const user = await User.findByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        // 현재 비밀번호 검증
        const isValid = await User.verifyPassword(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: '현재 비밀번호가 올바르지 않습니다'
            });
        }

        // 비밀번호 변경
        await User.updatePassword(req.user.id, newPassword);

        console.log(`✅ 비밀번호 변경 성공: ${req.user.email}`);

        res.json({
            success: true,
            message: '비밀번호가 변경되었습니다'
        });
    } catch (error) {
        console.error('❌ 비밀번호 변경 에러:', error);
        res.status(500).json({
            success: false,
            message: '비밀번호 변경 중 오류가 발생했습니다'
        });
    }
};

module.exports = {
    login,
    logout,
    me,
    changePassword
};
