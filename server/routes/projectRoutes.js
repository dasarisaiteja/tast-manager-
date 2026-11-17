const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createProject,
  getProjects,
} = require('../controllers/projectController');

// All project routes require authentication
router.use(authenticate);

router.route('/')
  .post(createProject)
  .get(getProjects);

module.exports = router;
