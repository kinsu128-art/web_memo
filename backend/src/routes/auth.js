const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 공개 라우트
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// 인증 필요 라우트
router.get('/me', authMiddleware, authController.me);
router.put('/password', authMiddleware, authController.changePassword);

module.exports = router;
