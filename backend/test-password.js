#!/usr/bin/env node
/**
 * 비밀번호 검증 테스트 스크립트
 *
 * 사용법:
 *   node backend/test-password.js <이메일>
 *
 * 예시:
 *   node backend/test-password.js test@dklok.com
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sql, poolPromise } = require('./src/db');

const email = process.argv[2];

if (!email) {
    console.error('❌ 이메일을 입력해주세요.');
    console.log('\n사용법: node backend/test-password.js <이메일>');
    console.log('예시: node backend/test-password.js test@dklok.com\n');
    process.exit(1);
}

async function testPassword() {
    try {
        console.log('\n🔐 비밀번호 검증 테스트\n');
        console.log('이메일:', email);

        // 데이터베이스에서 사용자 조회
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar(255), email)
            .query('SELECT * FROM memo_users WHERE email = @email');

        const user = result.recordset[0];

        if (!user) {
            console.error('❌ 사용자를 찾을 수 없습니다:', email);
            process.exit(1);
        }

        console.log('\n✅ 사용자 정보:');
        console.log('  ID:', user.id);
        console.log('  Email:', user.email);
        console.log('  Name:', user.name);
        console.log('  Role:', user.role);
        console.log('  Active:', user.is_active);
        console.log('  Created:', user.created_at);

        console.log('\n🔑 비밀번호 해시 정보:');
        console.log('  해시 값:', user.password);
        console.log('  해시 길이:', user.password?.length);
        console.log('  해시 타입:', typeof user.password);
        console.log('  해시 시작:', user.password?.substring(0, 7));

        // 알려진 해시와 비교
        const knownHash = '$2a$10$WJPf3zfP8mRfTNOCbHlWwOXGaKl3.4UxGKP7fKxCJqKZdPLk2m.Ku';
        console.log('\n🔍 알려진 해시와 비교:');
        console.log('  알려진 해시:', knownHash);
        console.log('  일치 여부:', user.password === knownHash);

        // 다양한 비밀번호로 테스트
        const testPasswords = ['test123', 'Test123', 'TEST123', 'test', '123'];

        console.log('\n🧪 테스트 비밀번호 검증:');
        for (const testPwd of testPasswords) {
            const isValid = await bcrypt.compare(testPwd, user.password);
            console.log(`  "${testPwd}" => ${isValid ? '✅ 성공' : '❌ 실패'}`);
        }

        console.log('\n💡 새 해시 생성 (test123):');
        const newHash = await bcrypt.hash('test123', 10);
        console.log('  생성된 해시:', newHash);

        const testWithNewHash = await bcrypt.compare('test123', newHash);
        console.log('  새 해시로 검증:', testWithNewHash ? '✅ 성공' : '❌ 실패');

        console.log('\n📝 SQL 업데이트 명령어:');
        console.log(`  UPDATE memo_users SET password = '${knownHash}' WHERE email = '${email}';`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ 에러 발생:', error);
        process.exit(1);
    }
}

testPassword();
