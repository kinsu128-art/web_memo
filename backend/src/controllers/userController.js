const User = require('../models/User');

/**
 * 모든 사용자 조회
 * GET /api/users
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        res.json({
            success: true,
            data: users,
            count: users.length
        });
    } catch (error) {
        console.error('❌ 사용자 목록 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 목록 조회 중 오류가 발생했습니다'
        });
    }
};

/**
 * 특정 사용자 조회
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('❌ 사용자 조회 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 조회 중 오류가 발생했습니다'
        });
    }
};

/**
 * 새 사용자 생성
 * POST /api/users
 */
const createUser = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // 입력 검증
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: '이메일, 비밀번호, 이름은 필수입니다'
            });
        }

        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: '올바른 이메일 형식이 아닙니다'
            });
        }

        // 비밀번호 길이 검증
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: '비밀번호는 6자 이상이어야 합니다'
            });
        }

        // 이메일 중복 확인
        const isEmailTaken = await User.isEmailTaken(email);
        if (isEmailTaken) {
            return res.status(400).json({
                success: false,
                message: '이미 사용 중인 이메일입니다'
            });
        }

        // 역할 검증
        const validRoles = ['user', 'admin'];
        const userRole = validRoles.includes(role) ? role : 'user';

        // 사용자 생성
        const user = await User.create(email, password, name, userRole);

        console.log(`✅ 새 사용자 생성: ${email} (${userRole})`);

        res.status(201).json({
            success: true,
            message: '사용자가 생성되었습니다',
            data: user
        });
    } catch (error) {
        console.error('❌ 사용자 생성 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 생성 중 오류가 발생했습니다'
        });
    }
};

/**
 * 사용자 정보 수정
 * PUT /api/users/:id
 */
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, name, role, is_active } = req.body;

        // 사용자 존재 확인
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        // 이메일 중복 확인 (변경 시)
        if (email && email !== existingUser.email) {
            const isEmailTaken = await User.isEmailTaken(email, id);
            if (isEmailTaken) {
                return res.status(400).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다'
                });
            }
        }

        // 역할 검증 (변경 시)
        if (role) {
            const validRoles = ['user', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: '유효하지 않은 역할입니다'
                });
            }
        }

        // 자기 자신의 관리자 권한 제거 방지
        if (parseInt(id) === req.user.id && role === 'user' && existingUser.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: '자신의 관리자 권한을 제거할 수 없습니다'
            });
        }

        // 자기 자신 비활성화 방지
        if (parseInt(id) === req.user.id && is_active === false) {
            return res.status(400).json({
                success: false,
                message: '자신의 계정을 비활성화할 수 없습니다'
            });
        }

        // 사용자 수정
        const updatedUser = await User.update(id, { email, name, role, is_active });

        console.log(`✅ 사용자 수정: ${updatedUser.email}`);

        res.json({
            success: true,
            message: '사용자 정보가 수정되었습니다',
            data: updatedUser
        });
    } catch (error) {
        console.error('❌ 사용자 수정 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 수정 중 오류가 발생했습니다'
        });
    }
};

/**
 * 사용자 비밀번호 재설정 (관리자)
 * PUT /api/users/:id/password
 */
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // 입력 검증
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: '새 비밀번호는 6자 이상이어야 합니다'
            });
        }

        // 사용자 존재 확인
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        // 비밀번호 변경
        await User.updatePassword(id, newPassword);

        console.log(`✅ 비밀번호 재설정: ${user.email}`);

        res.json({
            success: true,
            message: '비밀번호가 재설정되었습니다'
        });
    } catch (error) {
        console.error('❌ 비밀번호 재설정 에러:', error);
        res.status(500).json({
            success: false,
            message: '비밀번호 재설정 중 오류가 발생했습니다'
        });
    }
};

/**
 * 사용자 삭제
 * DELETE /api/users/:id
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // 사용자 존재 확인
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다'
            });
        }

        // 자기 자신 삭제 방지
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: '자신의 계정을 삭제할 수 없습니다'
            });
        }

        // 사용자 삭제
        await User.delete(id);

        console.log(`✅ 사용자 삭제: ${user.email}`);

        res.json({
            success: true,
            message: '사용자가 삭제되었습니다'
        });
    } catch (error) {
        console.error('❌ 사용자 삭제 에러:', error);
        res.status(500).json({
            success: false,
            message: '사용자 삭제 중 오류가 발생했습니다'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    resetPassword,
    deleteUser
};
