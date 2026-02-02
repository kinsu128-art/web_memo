const express = require('express');
const router = express.Router();
const memoController = require('../controllers/memoController');

/**
 * GET /api/memos
 * 모든 메모 조회
 */
router.get('/', memoController.getAllMemos);

/**
 * GET /api/memos/favorite/list
 * 즐겨찾기된 메모만 조회
 */
router.get('/favorite/list', memoController.getFavorites);

/**
 * GET /api/memos/trash/list
 * 휴지통 메모 조회
 */
router.get('/trash/list', memoController.getTrash);

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
 * PUT /api/memos/:id/favorite
 * 즐겨찾기 토글
 */
router.put('/:id/favorite', memoController.toggleFavorite);

/**
 * PUT /api/memos/:id/restore
 * 메모 복원
 */
router.put('/:id/restore', memoController.restoreMemo);

/**
 * PUT /api/memos/:id
 * 메모 수정
 */
router.put('/:id', memoController.updateMemo);

/**
 * DELETE /api/memos/:id/permanent
 * 메모 완전 삭제
 */
router.delete('/:id/permanent', memoController.permanentDeleteMemo);

/**
 * DELETE /api/memos/:id
 * 메모 삭제
 */
router.delete('/:id', memoController.deleteMemo);

module.exports = router;
