-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认管理员账号 (用户名: admin, 密码: admin123)
-- 注意: 在生产环境中应该使用更强的密码并通过代码生成正确的哈希值
-- 这里的哈希值是示例，实际应用中应该使用bcrypt生成
INSERT INTO admins (username, password_hash, full_name)
VALUES ('admin', '$2b$10$X/hX1z6eMZjbH0HnG7luKOoNvALHzpJ3hQHx.MqK5fHWYkGZOyWDm', 'System Administrator')
ON CONFLICT (username) DO NOTHING; 