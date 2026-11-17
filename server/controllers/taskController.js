const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

/**
 * @desc    Create a task under an existing project
 * @route   POST /api/tasks
 * @access  Private (Authenticated User)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, assignedTo, projectId } = req.body;

    // 1. Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Task title is required and cannot be empty.',
      });
    }

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: projectId is required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Invalid projectId format.',
      });
    }

    // 2. Validate optional enum fields if provided
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: `Validation Error: Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`,
      });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Validation Error: Status must be one of: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    // 3. Verify that the referenced project belongs to the authenticated user's tenant
    const project = await Project.findOne({
      _id: projectId,
      tenantId: req.user.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found or does not belong to your organization.',
      });
    }

    // 4. Verify that assigned employee belongs to the same tenant (if assignedTo is specified)
    let assignedUserId = null;
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error: Invalid assignedTo User ID format.',
        });
      }

      const assignedUser = await User.findOne({
        _id: assignedTo,
        tenantId: req.user.tenantId,
      });

      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          error: 'Assigned employee does not exist or does not belong to your organization.',
        });
      }

      assignedUserId = assignedUser._id;
    }

    // 5. Prevent duplicate task titles in the same project
    const duplicateTask = await Task.findOne({
      projectId,
      title: title.trim(),
    });

    if (duplicateTask) {
      return res.status(409).json({
        success: false,
        error: `A task with the title '${title.trim()}' already exists in this project.`,
      });
    }

    // 6. Create task associated with user's tenant and creator
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: priority || 'Medium',
      status: status || 'Pending',
      assignedTo: assignedUserId,
      projectId,
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    // 7. Populate related references for the response
    await task.populate([
      { path: 'projectId', select: 'name status' },
      { path: 'assignedTo', select: 'name email role' },
      { path: 'createdBy', select: 'name email' },
    ]);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve tasks belonging only to the authenticated user's tenant
 * @route   GET /api/tasks
 * @access  Private (Authenticated User)
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, projectId, assignedTo } = req.query;

    // 1. Enforce strict tenant isolation
    const query = {
      tenantId: req.user.tenantId,
    };

    // 2. Validate and apply status filter
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}.`,
        });
      }
      query.status = status;
    }

    // 3. Validate and apply priority filter
    if (priority) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: `Invalid priority filter. Must be one of: ${VALID_PRIORITIES.join(', ')}.`,
        });
      }
      query.priority = priority;
    }

    // 4. Optional projectId filter
    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid projectId query filter format.',
        });
      }
      query.projectId = projectId;
    }

    // 5. Optional assignedTo filter
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid assignedTo query filter format.',
        });
      }
      query.assignedTo = assignedTo;
    }

    // 6. Query tasks, populate references, and sort by newest first
    const tasks = await Task.find(query)
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task's status
 * @route   PATCH /api/tasks/:id/status
 * @access  Private (Authenticated User)
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID format.',
      });
    }

    // 2. Validate status value
    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Validation Error: 'status' is required in request body.",
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Validation Error: Status must be one of: ${VALID_STATUSES.join(', ')}. Received: '${status}'.`,
      });
    }

    // 3. Atomically update the task verifying tenant boundary
    const task = await Task.findOneAndUpdate(
      {
        _id: id,
        tenantId: req.user.tenantId, // Guarantees task belongs to authenticated user's tenant
      },
      { status },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    // 4. Handle non-existent or foreign tenant task
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found or does not belong to your organization.',
      });
    }

    // 5. Return updated task
    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
};
