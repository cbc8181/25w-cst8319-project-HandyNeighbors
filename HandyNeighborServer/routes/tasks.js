const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// 创建任务
router.post('/create', taskController.createTask);

// 获取附近任务
router.get('/nearby', taskController.getNearbyTasks);

module.exports = router;
