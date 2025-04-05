const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const db = require('../config/db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// register user
router.post('/register', userController.registerUser);

// login user
router.post('/login', userController.loginUser);

//
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

//
router.post('/upload-avatar/:userId', upload.single('avatar'), async (req, res) => {
  console.log('📥 upload-avatar called!');
  console.log('👉 File:', req.file);
  console.log('👉 User ID:', req.params.userId);
  const userId = req.params.userId;
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const avatarUrl = `/avatars/${req.file.filename}`;

  try {
    await db.query('UPDATE users SET avatar_url = $1 WHERE id = $2', [avatarUrl, userId]);

    res.json({ success: true, avatar_url: avatarUrl });
  } catch (err) {
    console.error('❌ Database error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

//
router.post('/update-profile/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { description } = req.body;

  try {
    await db.query('UPDATE users SET description = $1 WHERE id = $2', [description, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err });
  }
});

module.exports = router;
