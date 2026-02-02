require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const memoRoutes = require('./routes/memos');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// 미들웨어 설정
// =====================

// CORS 설정
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parser 설정
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// =====================
// 라우트 설정
// =====================

// API 라우트
app.use('/api/memos', memoRoutes);

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 루트 엔드포인트
app.get('/', (req, res) => {
  res.status(200).json({
    message: '메모관리 API 서버',
    version: '1.0.0',
    endpoints: {
      memos: '/api/memos',
      health: '/health',
    },
  });
});

// =====================
// 에러 핸들링
// =====================

// 404 Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 엔드포인트를 찾을 수 없습니다',
    path: req.path,
  });
});

// 전역 에러 핸들러
app.use((err, req, res, next) => {
  console.error('❌ 에러:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// =====================
// 서버 시작
// =====================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║    메모관리 API 서버 시작됨        ║
╠════════════════════════════════════╣
║ 포트: ${PORT}                         ║
║ 환경: ${process.env.NODE_ENV || 'development'}              ║
║ 주소: http://localhost:${PORT}       ║
╚════════════════════════════════════╝
  `);
  console.log('📌 사용 가능한 엔드포인트:');
  console.log('   GET    /api/memos      - 메모 목록 조회');
  console.log('   GET    /api/memos/:id  - 메모 상세 조회');
  console.log('   POST   /api/memos      - 메모 생성');
  console.log('   PUT    /api/memos/:id  - 메모 수정');
  console.log('   DELETE /api/memos/:id  - 메모 삭제');
  console.log('   GET    /health         - 헬스 체크');
});

module.exports = app;
