require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const memoRoutes = require('./routes/memos');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === 'default-secret-key') {
  console.error('❌ JWT_SECRET이 설정되지 않았습니다. .env에 강력한 JWT_SECRET을 설정하세요.');
  process.exit(1);
}

// =====================
// 미들웨어 설정
// =====================

// 보안 헤더 설정
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS 설정
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost,http://localhost:80')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 레이트 리밋 설정
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

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

// 인증 라우트 (공개)
app.use('/api/auth', authLimiter, authRoutes);

// 사용자 관리 라우트 (관리자 전용 - 미들웨어에서 인증 처리)
app.use('/api/users', apiLimiter, userRoutes);

// 메모 라우트 (인증 필요)
app.use('/api/memos', apiLimiter, authMiddleware, memoRoutes);

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
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
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
  console.log('   POST   /api/auth/login    - 로그인');
  console.log('   POST   /api/auth/logout   - 로그아웃');
  console.log('   GET    /api/auth/me       - 내 정보 조회');
  console.log('   PUT    /api/auth/password - 비밀번호 변경');
  console.log('   GET    /api/users         - 사용자 목록 (관리자)');
  console.log('   POST   /api/users         - 사용자 생성 (관리자)');
  console.log('   GET    /api/memos         - 메모 목록 조회');
  console.log('   POST   /api/memos         - 메모 생성');
  console.log('   GET    /health            - 헬스 체크');
});

module.exports = app;
