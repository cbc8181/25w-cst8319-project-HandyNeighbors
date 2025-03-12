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

// 获取单个任务详情
exports.getTaskById = async (req, res) => {
  const { id } = req.params;

  try {
    // 获取任务详情，包括创建者和帮助者的信息
    const result = await pool.query(
      `SELECT t.*, 
              c.full_name as creator_name,
              h.full_name as helper_name
       FROM tasks t
       LEFT JOIN users c ON t.creator_id = c.id
       LEFT JOIN users h ON t.helper_id = h.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting task:', err);
    res.status(500).json({ error: err.message });
  }
};

// 更新任务状态
exports.updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;

  // 验证状态值
  const validStatuses = ['open', 'assigned', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {
    // 获取任务信息
    const taskResult = await pool.query(
      'SELECT * FROM tasks WHERE id = $1',
      [id]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = taskResult.rows[0];

    // 检查权限
    // 1. 创建者可以将任务设为open或cancelled
    // 2. 帮助者可以将任务设为completed
    // 3. 任务状态为open时，创建者可以将其设为assigned（通过申请系统）

    if (task.creator_id !== user_id && task.helper_id !== user_id) {
      return res.status(403).json({ error: 'You do not have permission to update this task' });
    }

    // 创建者权限
    if (task.creator_id === user_id) {
      if (status === 'completed') {
        return res.status(403).json({ error: 'Only the helper can mark a task as completed' });
      }

      if (status === 'assigned' && task.status === 'open') {
        return res.status(400).json({
          error: 'To assign a task, please accept an application from a helper'
        });
      }
    }

    // 帮助者权限
    if (task.helper_id === user_id) {
      if (status !== 'completed') {
        return res.status(403).json({
          error: 'Helpers can only mark tasks as completed'
        });
      }

      if (task.status !== 'assigned') {
        return res.status(400).json({
          error: 'Only assigned tasks can be marked as completed'
        });
      }
    }

    // 状态转换规则
    const allowedTransitions = {
      'open': ['cancelled'],
      'assigned': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': []
    };

    if (!allowedTransitions[task.status].includes(status) && status !== task.status) {
      return res.status(400).json({
        error: `Cannot change status from '${task.status}' to '${status}'`
      });
    }

    // 更新任务状态
    let updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    let updateValues = [status];
    let valueIndex = 2;

    // 如果任务被标记为完成，设置完成时间
    if (status === 'completed') {
      updateFields.push('completed_at = CURRENT_TIMESTAMP');
    }

    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')} 
      WHERE id = $${valueIndex} 
      RETURNING *
    `;

    const updateResult = await pool.query(
      updateQuery,
      [...updateValues, id]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error updating task status:', err);
    res.status(500).json({ error: err.message });
  }
};
