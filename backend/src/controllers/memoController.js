const Memo = require('../models/Memo');

/**
 * 모든 메모 조회
 */
exports.getAllMemos = async (req, res) => {
  try {
    const memos = await Memo.findAll(req.user.id);
    res.status(200).json({
      success: true,
      data: memos,
      count: memos.length,
    });
  } catch (error) {
    console.error('❌ 메모 목록 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '메모 목록을 불러올 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 특정 메모 조회
 */
exports.getMemoById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    const memo = await Memo.findById(id, req.user.id);

    if (!memo) {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(200).json({
      success: true,
      data: memo,
    });
  } catch (error) {
    console.error('❌ 메모 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '메모를 불러올 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 새 메모 생성
 */
exports.createMemo = async (req, res) => {
  try {
    const { title, content } = req.body;

    // 입력 검증
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용은 필수입니다',
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용을 입력해주세요',
      });
    }

    const memo = await Memo.create(title.trim(), content.trim(), req.user.id);

    res.status(201).json({
      success: true,
      message: '메모가 생성되었습니다',
      data: memo,
    });
  } catch (error) {
    console.error('❌ 메모 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '메모를 생성할 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 메모 수정
 */
exports.updateMemo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // 입력 검증
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용은 필수입니다',
      });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '제목과 내용을 입력해주세요',
      });
    }

    const memo = await Memo.update(id, title.trim(), content.trim(), req.user.id);

    res.status(200).json({
      success: true,
      message: '메모가 수정되었습니다',
      data: memo,
    });
  } catch (error) {
    console.error('❌ 메모 수정 실패:', error);

    if (error.message === '메모를 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(500).json({
      success: false,
      message: '메모를 수정할 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 메모 삭제
 */
exports.deleteMemo = async (req, res) => {
  try {
    const { id } = req.params;

    // 입력 검증
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    await Memo.delete(id, req.user.id);

    res.status(200).json({
      success: true,
      message: '메모가 삭제되었습니다',
    });
  } catch (error) {
    console.error('❌ 메모 삭제 실패:', error);

    if (error.message === '메모를 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(500).json({
      success: false,
      message: '메모를 삭제할 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 즐겨찾기 토글
 */
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    // 입력 검증
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    const memo = await Memo.toggleFavorite(id, req.user.id);

    res.status(200).json({
      success: true,
      message: memo.is_favorite ? '즐겨찾기 추가됨' : '즐겨찾기 제거됨',
      data: memo,
    });
  } catch (error) {
    console.error('❌ 즐겨찾기 토글 실패:', error);

    if (error.message === '메모를 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(500).json({
      success: false,
      message: '즐겨찾기 토글에 실패했습니다',
      error: error.message,
    });
  }
};

/**
 * 즐겨찾기된 메모만 조회
 */
exports.getFavorites = async (req, res) => {
  try {
    const memos = await Memo.findFavorites(req.user.id);
    res.status(200).json({
      success: true,
      data: memos,
      count: memos.length,
    });
  } catch (error) {
    console.error('❌ 즐겨찾기 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '즐겨찾기를 불러올 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 휴지통 메모 조회
 */
exports.getTrash = async (req, res) => {
  try {
    const memos = await Memo.findTrash(req.user.id);
    res.status(200).json({
      success: true,
      data: memos,
      count: memos.length,
    });
  } catch (error) {
    console.error('❌ 휴지통 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '휴지통을 불러올 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 메모 복원
 */
exports.restoreMemo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    const memo = await Memo.restore(id, req.user.id);

    res.status(200).json({
      success: true,
      message: '메모가 복원되었습니다',
      data: memo,
    });
  } catch (error) {
    console.error('❌ 메모 복원 실패:', error);

    if (error.message === '메모를 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(500).json({
      success: false,
      message: '메모를 복원할 수 없습니다',
      error: error.message,
    });
  }
};

/**
 * 메모 완전 삭제
 */
exports.permanentDeleteMemo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: '유효한 메모 ID를 입력해주세요',
      });
    }

    await Memo.permanentDelete(id, req.user.id);

    res.status(200).json({
      success: true,
      message: '메모가 완전히 삭제되었습니다',
    });
  } catch (error) {
    console.error('❌ 메모 완전 삭제 실패:', error);

    if (error.message === '메모를 찾을 수 없습니다') {
      return res.status(404).json({
        success: false,
        message: '메모를 찾을 수 없습니다',
      });
    }

    res.status(500).json({
      success: false,
      message: '메모를 삭제할 수 없습니다',
      error: error.message,
    });
  }
};
