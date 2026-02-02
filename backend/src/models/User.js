const pool = require('../db');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

class User {
    /**
     * 새 사용자 생성
     * @param {string} email - 이메일
     * @param {string} password - 비밀번호 (평문)
     * @param {string} name - 이름
     * @param {string} role - 역할 ('user' 또는 'admin')
     * @returns {Promise<Object>} 생성된 사용자 정보
     */
    static async create(email, password, name, role = 'user') {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const [result] = await pool.query(
            'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, name, role]
        );

        return this.findById(result.insertId);
    }

    /**
     * 이메일로 사용자 조회
     * @param {string} email - 이메일
     * @returns {Promise<Object|null>} 사용자 정보 또는 null
     */
    static async findByEmail(email) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }

    /**
     * ID로 사용자 조회
     * @param {number} id - 사용자 ID
     * @returns {Promise<Object|null>} 사용자 정보 또는 null
     */
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    /**
     * 모든 사용자 조회
     * @returns {Promise<Array>} 사용자 목록
     */
    static async findAll() {
        const [rows] = await pool.query(
            'SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    /**
     * 사용자 정보 수정
     * @param {number} id - 사용자 ID
     * @param {Object} data - 수정할 데이터
     * @returns {Promise<Object|null>} 수정된 사용자 정보
     */
    static async update(id, data) {
        const allowedFields = ['email', 'name', 'role', 'is_active'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        await pool.query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    /**
     * 비밀번호 변경
     * @param {number} id - 사용자 ID
     * @param {string} newPassword - 새 비밀번호 (평문)
     * @returns {Promise<boolean>} 성공 여부
     */
    static async updatePassword(id, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        const [result] = await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * 사용자 삭제
     * @param {number} id - 사용자 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    static async delete(id) {
        // 사용자의 메모를 NULL로 설정 (orphan memos)
        await pool.query('UPDATE memos SET user_id = NULL WHERE user_id = ?', [id]);

        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * 비밀번호 검증
     * @param {string} plainPassword - 평문 비밀번호
     * @param {string} hashedPassword - 해시된 비밀번호
     * @returns {Promise<boolean>} 일치 여부
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    /**
     * 마지막 로그인 시간 업데이트
     * @param {number} id - 사용자 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    static async updateLastLogin(id) {
        const [result] = await pool.query(
            'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * 이메일 중복 확인
     * @param {string} email - 이메일
     * @param {number} excludeId - 제외할 사용자 ID (수정 시)
     * @returns {Promise<boolean>} 중복 여부
     */
    static async isEmailTaken(email, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        const values = [email];

        if (excludeId) {
            query += ' AND id != ?';
            values.push(excludeId);
        }

        const [rows] = await pool.query(query, values);
        return rows[0].count > 0;
    }
}

module.exports = User;
