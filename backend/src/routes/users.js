const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 모든 라우트에 인증 + 관리자 권한 필요
router.use(authMiddleware);
router.use(adminMiddleware);

// 사용자 관리 라우트
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/password', userController.resetPassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;
