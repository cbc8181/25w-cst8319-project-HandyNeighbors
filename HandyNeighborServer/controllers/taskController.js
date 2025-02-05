const pool = require('../config/db');

exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTask = async (req, res) => {
  const { title, description, location, reward } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, location, reward) VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5) RETURNING *',
      [title, description, location.longitude, location.latitude, reward]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
