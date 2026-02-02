const mysql = require('mysql2/promise');

// 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'memouser',
  password: process.env.DB_PASSWORD || 'memopass',
  database: process.env.DB_NAME || 'memos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  connectionTimeout: 10000,
});

// 연결 테스트 (5초 지연 후 시작)
setTimeout(() => {
  pool.getConnection()
    .then((connection) => {
      console.log('✅ MySQL 데이터베이스 연결 성공');
      connection.release();
    })
    .catch((err) => {
      console.warn('⚠️  MySQL 데이터베이스 연결 보류:', err.message);
      console.warn('데이터베이스가 아직 시작 중일 수 있습니다. 재시도 중...');
    });
}, 5000);

module.exports = pool;
