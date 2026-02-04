const sql = require('mssql');

// MSSQL 연결 설정
const config = {
  server: process.env.DB_HOST || '192.168.1.11',
  port: parseInt(process.env.DB_PORT) || 2433,
  database: process.env.DB_NAME || 'dk_it',
  user: process.env.DB_USER || 'dkenterb',
  password: process.env.DB_PASSWORD || 'Micro@4580',
  options: {
    encrypt: false, // Azure의 경우 true, 로컬 MSSQL의 경우 false
    trustServerCertificate: true, // 자체 서명 인증서 허용
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// 연결 풀 생성
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then((pool) => {
    console.log('✅ MSSQL 데이터베이스 연결 성공');
    return pool;
  })
  .catch((err) => {
    console.error('❌ MSSQL 데이터베이스 연결 실패:', err.message);
    console.error('연결 정보:', {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
    });
    // 재연결 시도
    setTimeout(() => {
      console.log('재연결 시도 중...');
    }, 5000);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
