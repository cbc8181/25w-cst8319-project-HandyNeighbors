-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  user_type VARCHAR(20) NOT NULL DEFAULT 'user',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  creator_id INTEGER NOT NULL REFERENCES users(id),
  helper_id INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  postal_code VARCHAR(10) NOT NULL,
  location VARCHAR(255) NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建默认管理员账户
INSERT INTO users (username, password, email, full_name, user_type)
VALUES (
  'admin',
  '$2b$10$rR5Vr1NEf.LEzAH1Vw6CM.1EFOWGiZYj8ydxZGtGxH4Q4Cy/CPXoO', -- admin123
  'admin@handyneighbor.com',
  'System Administrator',
  'admin'
) ON CONFLICT (username) DO NOTHING; 