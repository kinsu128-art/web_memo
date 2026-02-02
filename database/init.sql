-- 메모 데이터베이스 초기화 스크립트

-- 기존 테이블 확인 및 삭제 (선택사항)
DROP TABLE IF EXISTS memos;

-- memos 테이블 생성
CREATE TABLE IF NOT EXISTS memos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메모 ID',
    title VARCHAR(255) NOT NULL COMMENT '메모 제목',
    content LONGTEXT NOT NULL COMMENT '메모 내용',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 날짜',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 날짜',
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메모 저장 테이블';

-- 초기 샘플 데이터 (선택사항)
INSERT INTO memos (title, content) VALUES
('첫 번째 메모', '이것은 첫 번째 샘플 메모입니다.'),
('두 번째 메모', '이것은 두 번째 샘플 메모입니다.\n여러 줄을 포함할 수 있습니다.'),
('세 번째 메모', '메모관리 애플리케이션에 오신 것을 환영합니다!');

-- 데이터베이스 상태 확인
SELECT '메모관리 데이터베이스 초기화 완료' AS status;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES WHERE TABLE_SCHEMA='memos_db';
