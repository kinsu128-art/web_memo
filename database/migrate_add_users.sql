-- 사용자 인증 기능 마이그레이션 스크립트
-- 기존 데이터베이스에 users 테이블을 추가하고 memos에 user_id를 추가합니다.
-- 실행 방법: docker-compose exec db mysql -u root -p memos_db < database/migrate_add_users.sql

-- 1. users 테이블 생성
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '사용자 ID',
    email VARCHAR(255) NOT NULL UNIQUE COMMENT '이메일 (로그인 ID)',
    password VARCHAR(255) NOT NULL COMMENT '비밀번호 (bcrypt 해시)',
    name VARCHAR(100) NOT NULL COMMENT '사용자 이름',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT '역할',
    is_active BOOLEAN DEFAULT TRUE COMMENT '활성화 상태',
    last_login_at TIMESTAMP NULL COMMENT '마지막 로그인',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 날짜',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 날짜',
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='사용자 테이블';

-- 2. 초기 관리자 계정 생성 (비밀번호: admin123)
-- bcrypt hash for 'admin123' with 10 rounds
INSERT IGNORE INTO users (id, email, password, name, role) VALUES
(1, 'admin@memo.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '관리자', 'admin');

-- 3. memos 테이블에 user_id 컬럼 추가
ALTER TABLE memos ADD COLUMN IF NOT EXISTS user_id INT NULL COMMENT '사용자 ID' AFTER id;
ALTER TABLE memos ADD INDEX IF NOT EXISTS idx_user_id (user_id);

-- 4. 기존 메모에 관리자(user_id=1) 할당
UPDATE memos SET user_id = 1 WHERE user_id IS NULL;

-- 5. 마이그레이션 확인
SELECT CONCAT('✅ 마이그레이션 완료: ', COUNT(*), '명의 사용자') AS status FROM users;
SELECT CONCAT('✅ ', COUNT(*), '개의 메모가 관리자에게 할당됨') AS status FROM memos WHERE user_id = 1;
