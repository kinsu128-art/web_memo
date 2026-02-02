const pool = require('../db');

class Memo {
  /**
   * 모든 메모 조회
   * @returns {Promise<Array>} 메모 배열
   */
  static async findAll() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM memos ORDER BY updated_at DESC'
      );
      connection.release();
      return rows;
    } catch (error) {
      console.error('❌ 메모 조회 실패:', error);
      throw error;
    }
  }

  /**
   * ID로 메모 조회
   * @param {number} id 메모 ID
   * @returns {Promise<Object>} 메모 객체
   */
  static async findById(id) {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        'SELECT * FROM memos WHERE id = ?',
        [id]
      );
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
   * @returns {Promise<Object>} 생성된 메모 객체
   */
  static async create(title, content) {
    try {
      if (!title || !content) {
        throw new Error('제목과 내용은 필수입니다');
      }

      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'INSERT INTO memos (title, content) VALUES (?, ?)',
        [title, content]
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
   * @returns {Promise<Object>} 수정된 메모 객체
   */
  static async update(id, title, content) {
    try {
      if (!title || !content) {
        throw new Error('제목과 내용은 필수입니다');
      }

      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'UPDATE memos SET title = ?, content = ? WHERE id = ?',
        [title, content, id]
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
   * 메모 삭제
   * @param {number} id 메모 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  static async delete(id) {
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query(
        'DELETE FROM memos WHERE id = ?',
        [id]
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
}

module.exports = Memo;
