const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// 监听连接错误
pool.on('error', (err) => {
  console.error('\x1b[31m%s\x1b[0m', 'Unexpected database error:', err);
});

module.exports = pool;
