require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.registerUser = async (req, res) => {
  const { email, password, full_name, user_type, student_id } = req.body;

  try {
    // testing
    console.log('Received registration data:', req.body);

    // check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, user_type, student_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, hashedPassword, full_name, user_type, student_id]
    );

    res.status(201).json({ data: result.rows[0] });
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    // check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // generate JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        userType: user.user_type 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // return user info and token
    res.status(200).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          user_type: user.user_type
        },
        token
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// verify user session
exports.verifySession = async (req, res) => {
  res.status(200).json({ data: { user: req.user } });
};
