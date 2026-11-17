const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  createTask,
  getTasks,
  updateTaskStatus,
} = require('../controllers/taskController');

// All task routes require authentication
router.use(authenticate);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id/status')
  .patch(updateTaskStatus);

module.exports = router;
