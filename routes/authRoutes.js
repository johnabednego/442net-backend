// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, facialLogin , getMe } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/facial-recognition', facialLogin);
router.get('/me', protect, getMe);

module.exports = router;

