-- Migration: Add is_favorite column to memos table
-- This script safely adds the is_favorite column if it doesn't exist

-- 1. Add is_favorite column if it doesn't exist
ALTER TABLE memos ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE COMMENT '즐겨찾기 여부' AFTER content;

-- 2. Add index on is_favorite column if it doesn't exist
ALTER TABLE memos ADD INDEX IF NOT EXISTS idx_is_favorite (is_favorite);

-- 3. Verify the column was added
SHOW COLUMNS FROM memos;

-- 4. Confirm the update
SELECT COUNT(*) as total_memos, SUM(is_favorite = TRUE) as favorite_count FROM memos;
