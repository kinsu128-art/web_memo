const { sql, poolPromise } = require('../db');
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
        const pool = await poolPromise;

        const result = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .input('password', sql.NVarChar(255), hashedPassword)
            .input('name', sql.NVarChar(100), name)
            .input('role', sql.NVarChar(20), role)
            .query('INSERT INTO memo_users (email, password, name, role) VALUES (@email, @password, @name, @role); SELECT SCOPE_IDENTITY() AS id;');

        const newId = result.recordset[0].id;
        return this.findById(newId);
    }

    /**
     * 이메일로 사용자 조회
     * @param {string} email - 이메일
     * @returns {Promise<Object|null>} 사용자 정보 또는 null
     */
    static async findByEmail(email) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .query('SELECT * FROM memo_users WHERE email = @email');
        return result.recordset[0] || null;
    }

    /**
     * ID로 사용자 조회
     * @param {number} id - 사용자 ID
     * @returns {Promise<Object|null>} 사용자 정보 또는 null
     */
    static async findById(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM memo_users WHERE id = @id');
        return result.recordset[0] || null;
    }

    /**
     * 모든 사용자 조회
     * @returns {Promise<Array>} 사용자 목록
     */
    static async findAll() {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT id, email, name, role, is_active, last_login_at, created_at, updated_at FROM memo_users ORDER BY created_at DESC');
        return result.recordset;
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
        const pool = await poolPromise;
        const request = pool.request().input('id', sql.Int, id);

        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = @${field}`);

                // 데이터 타입 지정
                if (field === 'is_active') {
                    request.input(field, sql.Bit, data[field] ? 1 : 0);
                } else if (field === 'email') {
                    request.input(field, sql.NVarChar(255), data[field]);
                } else if (field === 'name') {
                    request.input(field, sql.NVarChar(100), data[field]);
                } else if (field === 'role') {
                    request.input(field, sql.NVarChar(20), data[field]);
                }
            }
        }

        if (updates.length === 0) {
            return this.findById(id);
        }

        await request.query(`UPDATE memo_users SET ${updates.join(', ')} WHERE id = @id`);
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
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('password', sql.NVarChar(255), hashedPassword)
            .query('UPDATE memo_users SET password = @password WHERE id = @id');

        return result.rowsAffected[0] > 0;
    }

    /**
     * 사용자 삭제
     * @param {number} id - 사용자 ID
     * @returns {Promise<boolean>} 삭제 성공 여부
     */
    static async delete(id) {
        const pool = await poolPromise;

        // 사용자의 메모를 NULL로 설정 (orphan memos)
        await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE memos SET user_id = NULL WHERE user_id = @id');

        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM memo_users WHERE id = @id');

        return result.rowsAffected[0] > 0;
    }

    /**
     * 비밀번호 검증
     * @param {string} plainPassword - 평문 비밀번호
     * @param {string} hashedPassword - 해시된 비밀번호
     * @returns {Promise<boolean>} 일치 여부
     */
    static async verifyPassword(plainPassword, hashedPassword) {
        console.log('🔍 [verifyPassword] 시작');
        console.log('🔍 평문 비밀번호:', plainPassword);
        console.log('🔍 평문 비밀번호 길이:', plainPassword?.length);
        console.log('🔍 평문 비밀번호 타입:', typeof plainPassword);
        console.log('🔍 해시 비밀번호:', hashedPassword);
        console.log('🔍 해시 비밀번호 길이:', hashedPassword?.length);
        console.log('🔍 해시 비밀번호 타입:', typeof hashedPassword);
        console.log('🔍 해시 시작 문자:', hashedPassword?.substring(0, 7));

        const result = await bcrypt.compare(plainPassword, hashedPassword);
        console.log('🔍 bcrypt.compare 결과:', result);

        return result;
    }

    /**
     * 마지막 로그인 시간 업데이트
     * @param {number} id - 사용자 ID
     * @returns {Promise<boolean>} 성공 여부
     */
    static async updateLastLogin(id) {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('UPDATE memo_users SET last_login_at = GETDATE() WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }

    /**
     * 이메일 중복 확인
     * @param {string} email - 이메일
     * @param {number} excludeId - 제외할 사용자 ID (수정 시)
     * @returns {Promise<boolean>} 중복 여부
     */
    static async isEmailTaken(email, excludeId = null) {
        const pool = await poolPromise;
        let query = 'SELECT COUNT(*) as count FROM memo_users WHERE email = @email';
        const request = pool.request().input('email', sql.NVarChar(255), email);

        if (excludeId) {
            query += ' AND id != @excludeId';
            request.input('excludeId', sql.Int, excludeId);
        }

        const result = await request.query(query);
        return result.recordset[0].count > 0;
    }
}

module.exports = User;
