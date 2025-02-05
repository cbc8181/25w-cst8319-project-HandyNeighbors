const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// register user
router.post('/register', userController.registerUser);

// login user
router.post('/login', userController.loginUser);

module.exports = router;
