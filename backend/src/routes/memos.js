const express = require('express');
const router = express.Router();
const memoController = require('../controllers/memoController');

/**
 * GET /api/memos
 * 모든 메모 조회
 */
router.get('/', memoController.getAllMemos);

/**
 * GET /api/memos/:id
 * 특정 메모 조회
 */
router.get('/:id', memoController.getMemoById);

/**
 * POST /api/memos
 * 새 메모 생성
 */
router.post('/', memoController.createMemo);

/**
 * PUT /api/memos/:id
 * 메모 수정
 */
router.put('/:id', memoController.updateMemo);

/**
 * DELETE /api/memos/:id
 * 메모 삭제
 */
router.delete('/:id', memoController.deleteMemo);

/**
 * PUT /api/memos/:id/favorite
 * 즐겨찾기 토글
 */
router.put('/:id/favorite', memoController.toggleFavorite);

/**
 * GET /api/memos/favorite
 * 즐겨찾기된 메모만 조회
 */
router.get('/favorite/list', memoController.getFavorites);

module.exports = router;
