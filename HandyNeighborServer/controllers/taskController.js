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
  const { title, description, creator_id, location, postal_code, reward, category } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, creator_id, status, postal_code, location, reward, category) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326), $8, $9) RETURNING *',
      [title, description, creator_id, 'open', postal_code, location.coordinates[0], location.coordinates[1], reward, category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
