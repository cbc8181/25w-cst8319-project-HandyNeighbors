require('dotenv').config();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
  const { email, password, full_name, user_type, student_id } = req.body;

  try {
    console.log('Received registration request:', {
      ...req.body,
      password: '***hidden***'
    });

    // Check if user already exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, user_type, student_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, user_type',
      [email, hashedPassword, full_name, user_type, student_id]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        userType: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Registration successful for:', user.email);

    // Return user data and token
    res.status(201).json({
      token,
      user
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login attempt for:', email);

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = userCheck.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        userType: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type
      },
      token
    };

    console.log('Login successful for:', email);
    console.log('Login response data:', responseData);

    // Return user info and token
    res.json(responseData);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Verify user session
exports.verifySession = async (req, res) => {
  res.json({ user: req.user });
};
