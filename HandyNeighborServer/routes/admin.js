const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const { authenticateToken } = require('../middleware/auth');

// 获取统计数据
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    // 获取用户总数
    const userCountResult = await pool.query('SELECT COUNT(*) as total FROM users');

    // 获取任务统计
    const taskStatsResult = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open,
        COUNT(*) FILTER (WHERE status = 'assigned') as assigned,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
      FROM tasks
    `);

    // 获取最近的用户
    const recentUsersResult = await pool.query(`
      SELECT id, username, full_name, email, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // 获取最近的任务
    const recentTasksResult = await pool.query(`
      SELECT id, title, status, created_at
      FROM tasks
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      data: {
        users: {
          total: parseInt(userCountResult.rows[0].total)
        },
        tasks: {
          stats: taskStatsResult.rows[0]
        },
        recent: {
          users: recentUsersResult.rows,
          tasks: recentTasksResult.rows
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取所有任务
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { status } = req.query;
    let query = `
      SELECT 
        t.*,
        c.full_name as creator_name,
        c.email as creator_email,
        h.full_name as helper_name,
        h.email as helper_email
      FROM tasks t
      JOIN users c ON t.creator_id = c.id
      LEFT JOIN users h ON t.helper_id = h.id
    `;

    if (status && status !== 'all') {
      query += ` WHERE t.status = $1`;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = status && status !== 'all'
      ? await pool.query(query, [status])
      : await pool.query(query);

    const tasks = result.rows.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      creator: {
        full_name: task.creator_name,
        email: task.creator_email
      },
      helper: task.helper_name ? {
        full_name: task.helper_name,
        email: task.helper_email
      } : null,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));

    res.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 更新任务状态
router.put('/tasks/:id/status', authenticateToken, async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['open', 'assigned', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // 更新任务状态
    const result = await pool.query(
      'UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 获取所有用户
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const result = await pool.query(`
      SELECT id, username, email, full_name, user_type, status, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 更新用户状态
router.put('/users/:id/status', authenticateToken, async (req, res) => {
  try {
    // 检查是否是管理员
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 验证状态值
    const validStatuses = ['active', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // 更新用户状态
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ data: result.rows[0] });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 