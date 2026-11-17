const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  register,
  login,
  getTenantUsers,
  seedDemoData,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-seed', seedDemoData);
router.get('/users', authenticate, getTenantUsers);

module.exports = router;
