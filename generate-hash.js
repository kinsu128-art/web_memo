#!/usr/bin/env node
/**
 * bcrypt 해시 생성 스크립트
 *
 * 사용법:
 *   node generate-hash.js <비밀번호>
 *
 * 예시:
 *   node generate-hash.js test123
 */

const bcrypt = require('bcryptjs');

// 명령줄 인자에서 비밀번호 가져오기
const password = process.argv[2];

if (!password) {
    console.error('❌ 비밀번호를 입력해주세요.');
    console.log('\n사용법: node generate-hash.js <비밀번호>');
    console.log('예시: node generate-hash.js test123\n');
    process.exit(1);
}

const SALT_ROUNDS = 10; // 프로젝트 기본값

console.log('\n🔐 bcrypt 해시 생성 중...\n');
console.log('비밀번호:', password);
console.log('Salt Rounds:', SALT_ROUNDS);
console.log('');

// 해시 생성
bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error('❌ 해시 생성 실패:', err);
        process.exit(1);
    }

    console.log('✅ 생성된 해시:');
    console.log(hash);
    console.log('');
    console.log('SQL에서 사용:');
    console.log(`'${hash}'`);
    console.log('');
});
