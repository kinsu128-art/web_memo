-- 메모 데이터베이스 초기화 스크립트
-- 주의: 이 스크립트는 처음 실행할 때만 자동으로 실행됩니다
-- (MySQL 데이터 디렉토리가 비어있을 때)

-- 1. memos 테이블 존재 확인 및 생성
CREATE TABLE IF NOT EXISTS memos (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '메모 ID',
    title VARCHAR(255) NOT NULL COMMENT '메모 제목',
    content LONGTEXT NOT NULL COMMENT '메모 내용',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '생성 날짜',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 날짜',
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='메모 저장 테이블';

-- 2. 초기 샘플 데이터 삽입 (테이블이 비어있을 때만)
-- INSERT IGNORE를 사용하여 중복 삽입 방지
INSERT IGNORE INTO memos (id, title, content) VALUES
(1, '첫 번째 메모', '이것은 첫 번째 샘플 메모입니다.'),
(2, '두 번째 메모', '이것은 두 번째 샘플 메모입니다.\n여러 줄을 포함할 수 있습니다.'),
(3, '세 번째 메모', '메모관리 애플리케이션에 오신 것을 환영합니다!');

-- 3. 초기화 결과 확인 (선택사항)
SELECT CONCAT('✅ 메모관리 데이터베이스 초기화 완료 (', COUNT(*), '개 메모)') AS status
FROM memos;
