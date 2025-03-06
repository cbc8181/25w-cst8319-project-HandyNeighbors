const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database!');
    
    // Test query to check if users table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (result.rows[0].exists) {
      console.log('Users table exists in the database!');
      
      // Count users in the table
      const userCount = await client.query('SELECT COUNT(*) FROM users;');
      console.log(`Number of users in database: ${userCount.rows[0].count}`);
    } else {
      console.log('Users table does not exist. Please run the DDL script.');
    }

    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    // Close the pool
    await pool.end();
  }
}

testConnection(); 