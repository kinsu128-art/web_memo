-- 메모 데이터베이스 초기화 스크립트 (MSSQL)
-- 주의: 이 스크립트는 MSSQL 서버에서 수동으로 실행해야 합니다

-- 1. memo_users 테이블 생성
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='memo_users' AND xtype='U')
BEGIN
    CREATE TABLE memo_users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        email NVARCHAR(255) NOT NULL UNIQUE,
        password NVARCHAR(255) NOT NULL,
        name NVARCHAR(100) NOT NULL,
        role NVARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        is_active BIT DEFAULT 1,
        last_login_at DATETIME2 NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    -- 인덱스 생성
    CREATE INDEX idx_email ON memo_users(email);
    CREATE INDEX idx_role ON memo_users(role);
    CREATE INDEX idx_is_active ON memo_users(is_active);
END
GO

-- 2. 초기 관리자 계정 생성 (비밀번호: test123)
-- bcrypt hash for 'test123' with 10 rounds
IF NOT EXISTS (SELECT * FROM memo_users WHERE email = 'test@dklok.com')
BEGIN
    SET IDENTITY_INSERT memo_users ON;
    INSERT INTO memo_users (id, email, password, name, role)
    VALUES (1, 'test@dklok.com', '$2a$10$WJPf3zfP8mRfTNOCbHlWwOXGaKl3.4UxGKP7fKxCJqKZdPLk2m.Ku', N'테스트관리자', 'admin');
    SET IDENTITY_INSERT memo_users OFF;
END
GO

-- 3. memos 테이블 생성
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='memos' AND xtype='U')
BEGIN
    CREATE TABLE memos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        title NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        is_favorite BIT DEFAULT 0,
        is_deleted BIT DEFAULT 0,
        deleted_at DATETIME2 NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    -- 인덱스 생성
    CREATE INDEX idx_user_id ON memos(user_id);
    CREATE INDEX idx_created_at ON memos(created_at);
    CREATE INDEX idx_updated_at ON memos(updated_at);
    CREATE INDEX idx_is_favorite ON memos(is_favorite);
    CREATE INDEX idx_is_deleted ON memos(is_deleted);
END
GO

-- 4. updated_at 자동 업데이트를 위한 트리거 생성 (memo_users)
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_memo_users_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_memo_users_updated_at
    ON memo_users
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE memo_users
        SET updated_at = GETDATE()
        FROM memo_users u
        INNER JOIN inserted i ON u.id = i.id;
    END
    ');
END
GO

-- 5. updated_at 자동 업데이트를 위한 트리거 생성 (memos)
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'trg_memos_updated_at')
BEGIN
    EXEC('
    CREATE TRIGGER trg_memos_updated_at
    ON memos
    AFTER UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;
        UPDATE memos
        SET updated_at = GETDATE()
        FROM memos m
        INNER JOIN inserted i ON m.id = i.id;
    END
    ');
END
GO

-- 6. 초기 샘플 데이터 삽입 (테이블이 비어있을 때만)
-- user_id = 1 (관리자)
IF NOT EXISTS (SELECT * FROM memos WHERE id = 1)
BEGIN
    SET IDENTITY_INSERT memos ON;
    INSERT INTO memos (id, user_id, title, content, is_favorite) VALUES
    (1, 1, N'첫 번째 메모', N'이것은 첫 번째 샘플 메모입니다.', 0),
    (2, 1, N'두 번째 메모', N'이것은 두 번째 샘플 메모입니다.' + CHAR(13) + CHAR(10) + N'여러 줄을 포함할 수 있습니다.', 0),
    (3, 1, N'세 번째 메모', N'메모관리 애플리케이션에 오신 것을 환영합니다!', 0);
    SET IDENTITY_INSERT memos OFF;
END
GO

-- 7. 초기화 결과 확인
SELECT CONCAT('사용자 테이블 초기화 완료: ', COUNT(*), '명') AS status FROM memo_users;
SELECT CONCAT('메모 테이블 초기화 완료: ', COUNT(*), '개') AS status FROM memos;
GO
