const bcrypt = require('bcrypt');
const pool = require('../db/db');

async function initializeAdmin() {
  try {
    // 生成密码哈希
    const password = 'admin123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 创建管理员表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // 插入默认管理员
    const result = await pool.query(`
      INSERT INTO admins (username, password_hash, full_name, email)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (username) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email
      RETURNING id
    `, ['admin', passwordHash, 'System Administrator', 'admin@handyneighbor.com']);

    const adminId = result.rows[0].id;

    // 创建权限表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES admins(id),
        permission_name VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(admin_id, permission_name)
      )
    `);

    // 添加权限
    const permissions = ['manage_users', 'manage_tasks', 'view_statistics', 'manage_system'];
    for (const permission of permissions) {
      await pool.query(`
        INSERT INTO admin_permissions (admin_id, permission_name)
        VALUES ($1, $2)
        ON CONFLICT (admin_id, permission_name) DO NOTHING
      `, [adminId, permission]);
    }

    console.log('Successfully initialized admin account:');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error initializing admin:', error);
    process.exit(1);
  }
}

initializeAdmin(); 