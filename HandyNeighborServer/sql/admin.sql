-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 创建默认管理员账户
-- 默认密码: admin123
INSERT INTO admins (username, password_hash, full_name, email)
VALUES (
    'admin',
    -- 这是 'admin123' 的bcrypt哈希值
    '$2b$10$rR3PsXvF.YJ5vZJJz8YGxOJzH.BqFE/DxUj5vZ5vZ5vZ5vZ5vZ5vZ',
    'System Administrator',
    'admin@handyneighbor.com'
) ON CONFLICT (username) DO NOTHING;

-- 添加管理员权限相关的表
CREATE TABLE IF NOT EXISTS admin_permissions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    permission_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_id, permission_name)
);

-- 为默认管理员添加所有权限
INSERT INTO admin_permissions (admin_id, permission_name)
SELECT 
    (SELECT id FROM admins WHERE username = 'admin'),
    permission_name
FROM (
    VALUES 
        ('manage_users'),
        ('manage_tasks'),
        ('view_statistics'),
        ('manage_system')
) AS permissions(permission_name)
ON CONFLICT DO NOTHING;

-- 添加管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES admins(id),
    action_type VARCHAR(50) NOT NULL,
    action_details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 