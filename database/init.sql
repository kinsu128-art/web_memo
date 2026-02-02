-- 메모 데이터베이스 초기화 스크립트
-- 주의: 이 스크립트는 처음 실행할 때만 자동으로 실행됩니다
-- (MySQL 데이터 디렉토리가 비어있을 때)

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

-- 2. 초기 관리자 계정 생성 (비밀번호: test123)
-- bcrypt hash for 'test123' with 10 rounds
INSERT IGNORE INTO users (id, email, password, name, role) VALUES
(1, 'test@dklok.com', '$2a$10$PLACEHOLDER_HASH_WILL_BE_UPDATED', '테스트관리자', 'admin');

-- 3. memos 테이블 생성
CREATE TABLE IF NOT EXISTS memos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메모 ID',
    user_id INT NULL COMMENT '사용자 ID',
    title VARCHAR(255) NOT NULL COMMENT '메모 제목',
    content LONGTEXT NOT NULL COMMENT '메모 내용',
    is_favorite BOOLEAN DEFAULT FALSE COMMENT '즐겨찾기 여부',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부 (휴지통)',
    deleted_at TIMESTAMP NULL COMMENT '삭제 날짜',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 날짜',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 날짜',
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at),
    INDEX idx_is_favorite (is_favorite),
    INDEX idx_is_deleted (is_deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메모 저장 테이블';

-- 4. 초기 샘플 데이터 삽입 (테이블이 비어있을 때만)
-- INSERT IGNORE를 사용하여 중복 삽입 방지
-- user_id = 1 (관리자)
INSERT IGNORE INTO memos (id, user_id, title, content, is_favorite) VALUES
(1, 1, '첫 번째 메모', '이것은 첫 번째 샘플 메모입니다.', FALSE),
(2, 1, '두 번째 메모', '이것은 두 번째 샘플 메모입니다.\n여러 줄을 포함할 수 있습니다.', FALSE),
(3, 1, '세 번째 메모', '메모관리 애플리케이션에 오신 것을 환영합니다!', FALSE);

-- 5. 초기화 결과 확인
SELECT CONCAT('사용자 테이블 초기화 완료: ', COUNT(*), '명') AS status FROM users;
SELECT CONCAT('메모 테이블 초기화 완료: ', COUNT(*), '개') AS status FROM memos;
