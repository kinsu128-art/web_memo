const { sql, poolPromise } = require('../db');

class Memo {
  /**
   * 모든 메모 조회 (사용자별)
   * @param {number} userId 사용자 ID
   * @returns {Promise<Array>} 메모 배열
   */
  static async findAll(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM memos WHERE user_id = @userId AND is_deleted = 0 ORDER BY updated_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('❌ 메모 조회 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 메모 조회 (사용자 확인 포함)
   * @param {number} id 메모 ID
   * @param {number} userId 사용자 ID (선택적 - 소유권 확인용)
   * @returns {Promise<Object>} 메모 객체
   */
  static async findById(id, userId = null) {
    try {
      const pool = await poolPromise;
      let query = 'SELECT * FROM memos WHERE id = @id';
      const request = pool.request().input('id', sql.Int, id);

      if (userId !== null) {
        query += ' AND user_id = @userId';
        request.input('userId', sql.Int, userId);
      }

      const result = await request.query(query);
      return result.recordset[0] || null;
    } catch (error) {
      console.error('❌ 메모 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 새로운 메모 생성
   * @param {string} title 메모 제목
   * @param {string} content 메모 내용
   * @param {number} userId 사용자 ID
   * @returns {Promise<Object>} 생성된 메모 객체
   */
  static async create(title, content, userId) {
    try {
      if (!title || !content) {
        throw new Error('제목과 내용은 필수입니다');
      }

      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('title', sql.NVarChar(255), title)
        .input('content', sql.NVarChar(sql.MAX), content)
        .query('INSERT INTO memos (user_id, title, content) VALUES (@userId, @title, @content); SELECT SCOPE_IDENTITY() AS id;');

      const newId = result.recordset[0].id;
      // 생성된 메모 반환
      return this.findById(newId);
    } catch (error) {
      console.error('❌ 메모 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 메모 수정
   * @param {number} id 메모 ID
   * @param {string} title 메모 제목
   * @param {string} content 메모 내용
   * @param {number} userId 사용자 ID
   * @returns {Promise<Object>} 수정된 메모 객체
   */
  static async update(id, title, content, userId) {
    try {
      if (!title || !content) {
        throw new Error('제목과 내용은 필수입니다');
      }

      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .input('title', sql.NVarChar(255), title)
        .input('content', sql.NVarChar(sql.MAX), content)
        .query('UPDATE memos SET title = @title, content = @content WHERE id = @id AND user_id = @userId');

      if (result.rowsAffected[0] === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      // 수정된 메모 반환
      return this.findById(id);
    } catch (error) {
      console.error('❌ 메모 수정 실패:', error);
      throw error;
    }
  }

  /**
   * 메모 삭제 (휴지통으로 이동)
   * @param {number} id 메모 ID
   * @param {number} userId 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id, userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .query('UPDATE memos SET is_deleted = 1, deleted_at = GETDATE() WHERE id = @id AND user_id = @userId AND is_deleted = 0');

      if (result.rowsAffected[0] === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      return true;
    } catch (error) {
      console.error('❌ 메모 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 휴지통 메모 조회 (사용자별)
   * @param {number} userId 사용자 ID
   * @returns {Promise<Array>} 삭제된 메모 배열
   */
  static async findTrash(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM memos WHERE user_id = @userId AND is_deleted = 1 ORDER BY deleted_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('❌ 휴지통 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 메모 복원 (휴지통에서)
   * @param {number} id 메모 ID
   * @param {number} userId 사용자 ID
   * @returns {Promise<Object>} 복원된 메모 객체
   */
  static async restore(id, userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .query('UPDATE memos SET is_deleted = 0, deleted_at = NULL WHERE id = @id AND user_id = @userId AND is_deleted = 1');

      if (result.rowsAffected[0] === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      return this.findById(id);
    } catch (error) {
      console.error('❌ 메모 복원 실패:', error);
      throw error;
    }
  }

  /**
   * 메모 완전 삭제
   * @param {number} id 메모 ID
   * @param {number} userId 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async permanentDelete(id, userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .query('DELETE FROM memos WHERE id = @id AND user_id = @userId AND is_deleted = 1');

      if (result.rowsAffected[0] === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      return true;
    } catch (error) {
      console.error('❌ 메모 완전 삭제 실패:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 토글
   * @param {number} id 메모 ID
   * @param {number} userId 사용자 ID
   * @returns {Promise<Object>} 수정된 메모 객체
   */
  static async toggleFavorite(id, userId) {
    try {
      const pool = await poolPromise;

      // 현재 상태 확인 (사용자 확인 포함)
      const selectResult = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .query('SELECT is_favorite FROM memos WHERE id = @id AND user_id = @userId');

      if (selectResult.recordset.length === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      const currentState = selectResult.recordset[0].is_favorite;
      const newState = !currentState;

      // 상태 업데이트
      const updateResult = await pool.request()
        .input('id', sql.Int, id)
        .input('userId', sql.Int, userId)
        .input('newState', sql.Bit, newState ? 1 : 0)
        .query('UPDATE memos SET is_favorite = @newState WHERE id = @id AND user_id = @userId');

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error('메모를 찾을 수 없습니다');
      }

      // 수정된 메모 반환
      return this.findById(id);
    } catch (error) {
      console.error('❌ 즐겨찾기 토글 실패:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기된 메모만 조회 (사용자별)
   * @param {number} userId 사용자 ID
   * @returns {Promise<Array>} 즐겨찾기 메모 배열
   */
  static async findFavorites(userId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('SELECT * FROM memos WHERE user_id = @userId AND is_favorite = 1 AND is_deleted = 0 ORDER BY updated_at DESC');
      return result.recordset;
    } catch (error) {
      console.error('❌ 즐겨찾기 조회 실패:', error);
      throw error;
    }
  }
}

module.exports = Memo;
