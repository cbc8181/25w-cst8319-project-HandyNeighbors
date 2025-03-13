-- 向tasks表添加category字段
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category VARCHAR(50); 