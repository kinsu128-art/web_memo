const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';

/**
 * JWT 토큰 검증 미들웨어
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '인증 토큰이 필요합니다'
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, JWT_SECRET);

            // 사용자 정보 조회
            const user = await User.findById(decoded.userId);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '사용자를 찾을 수 없습니다'
                });
            }

            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: '비활성화된 계정입니다'
                });
            }

            // 요청 객체에 사용자 정보 추가
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            };

            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '토큰이 만료되었습니다'
                });
            }
            return res.status(401).json({
                success: false,
                message: '유효하지 않은 토큰입니다'
            });
        }
    } catch (error) {
        console.error('❌ 인증 미들웨어 에러:', error);
        return res.status(500).json({
            success: false,
            message: '인증 처리 중 오류가 발생했습니다'
        });
    }
};

/**
 * 관리자 권한 확인 미들웨어
 * authMiddleware 이후에 사용해야 합니다
 */
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: '인증이 필요합니다'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: '관리자 권한이 필요합니다'
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware
};
