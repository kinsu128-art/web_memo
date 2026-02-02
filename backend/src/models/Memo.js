const pool = require('../db');

class Memo {
  /**
   * 모든 메모 조회 (사용자별)
   * @param {number} userId 사용자 ID
   * @returns {Promise<Array>} 메모 배열
   */
  static async findAll(userId) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM memos WHERE user_id = ? AND is_deleted = FALSE ORDER BY updated_at DESC',
        [userId]
      );
      connection.release();
      return rows;
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
      const connection = await pool.getConnection();
      let query = 'SELECT * FROM memos WHERE id = ?';
      const params = [id];

      if (userId !== null) {
        query += ' AND user_id = ?';
        params.push(userId);
      }

      const [rows] = await connection.query(query, params);
      connection.release();
      return rows[0] || null;
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

      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO memos (user_id, title, content) VALUES (?, ?, ?)',
        [userId, title, content]
      );
      connection.release();

      // 생성된 메모 반환
      return this.findById(result.insertId);
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

      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE memos SET title = ?, content = ? WHERE id = ? AND user_id = ?',
        [title, content, id, userId]
      );
      connection.release();

      if (result.affectedRows === 0) {
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
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE memos SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ? AND user_id = ? AND is_deleted = FALSE',
        [id, userId]
      );
      connection.release();

      if (result.affectedRows === 0) {
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
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM memos WHERE user_id = ? AND is_deleted = TRUE ORDER BY deleted_at DESC',
        [userId]
      );
      connection.release();
      return rows;
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
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE memos SET is_deleted = FALSE, deleted_at = NULL WHERE id = ? AND user_id = ? AND is_deleted = TRUE',
        [id, userId]
      );
      connection.release();

      if (result.affectedRows === 0) {
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
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM memos WHERE id = ? AND user_id = ? AND is_deleted = TRUE',
        [id, userId]
      );
      connection.release();

      if (result.affectedRows === 0) {
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
      const connection = await pool.getConnection();

      // 현재 상태 확인 (사용자 확인 포함)
      const [rows] = await connection.query(
        'SELECT is_favorite FROM memos WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (rows.length === 0) {
        connection.release();
        throw new Error('메모를 찾을 수 없습니다');
      }

      const currentState = rows[0].is_favorite;
      const newState = !currentState;

      // 상태 업데이트
      const [result] = await connection.query(
        'UPDATE memos SET is_favorite = ? WHERE id = ? AND user_id = ?',
        [newState, id, userId]
      );

      connection.release();

      if (result.affectedRows === 0) {
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
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM memos WHERE user_id = ? AND is_favorite = TRUE AND is_deleted = FALSE ORDER BY updated_at DESC',
        [userId]
      );
      connection.release();
      return rows;
    } catch (error) {
      console.error('❌ 즐겨찾기 조회 실패:', error);
      throw error;
    }
  }
}

module.exports = Memo;
