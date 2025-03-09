const pool = require('../config/db');
const { getCoordinatesFromPostalCode } = require('../config/geolocation');

// 获取所有任务
exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 创建任务
exports.createTask = async (req, res) => {
  const { title, description, postal_code, reward, creator_id } = req.body;
  console.log("Received data:", req.body);

  if (!postal_code) {
    return res.status(400).json({ error: 'Postal code is required' });
  }

  try {
    // 1️⃣ 获取 `postal_code` 的经纬度
    const coordinates = await getCoordinatesFromPostalCode(postal_code);
    if (!coordinates) {
      return res.status(500).json({ error: 'Failed to get coordinates' });
    }

    // 2️⃣ 存入数据库（使用 PostGIS `ST_SetSRID` 存储地理位置）
    const result = await pool.query(
        `INSERT INTO tasks (title, description, creator_id, status, postal_code, location, reward)
         VALUES ($1, $2, $3, 'open', $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7) RETURNING *`,
        [title, description, creator_id, postal_code, coordinates.longitude, coordinates.latitude, reward]  // ✅ 确保 7 个参数匹配
    );



    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 获取附近任务（PostGIS 版本）
exports.getNearbyTasks = async (req, res) => {
  const { lat, lng, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }
  console.log("Query Params:", req.query);
  try {
    // 1️⃣ 计算 `radius` 范围内的任务
    const result = await pool.query(
        `SELECT *,
                ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)) AS distance
         FROM tasks
         WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint($1, $2), 4326), $3)
         ORDER BY distance ASC`,
        [lng, lat, radius]
    );




    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('Error fetching nearby tasks:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
