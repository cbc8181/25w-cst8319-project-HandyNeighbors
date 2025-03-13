const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 获取所有任务
router.get('/', taskController.getTasks);

// 创建任务
router.post('/', taskController.createTask);

// 获取单个任务详情
router.get('/:id', taskController.getTaskById);

// 更新任务状态
router.put('/:id/status', taskController.updateTaskStatus);

module.exports = router;
