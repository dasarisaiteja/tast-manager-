const mongoose = require('mongoose');
const Project = require('../models/Project');

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private (Authenticated User)
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: Project name is required and cannot be empty.',
      });
    }

    // 2. Validate status if provided
    if (status && !['Active', 'Completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Validation Error: Project status must be either 'Active' or 'Completed'.",
      });
    }

    // 3. Prevent duplicate project name within the same tenant
    const existingProject = await Project.findOne({
      tenantId: req.user.tenantId,
      name: name.trim(),
    });

    if (existingProject) {
      return res.status(409).json({
        success: false,
        error: `A project with the name '${name.trim()}' already exists in your organization.`,
      });
    }

    // 4. Create project associated with authenticated user's tenant and creator
    const project = await Project.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      status: status || 'Active',
      createdBy: req.user._id,
      tenantId: req.user.tenantId,
    });

    // Populate creator details for the response
    await project.populate('createdBy', 'name email role');

    return res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Retrieve projects belonging to the authenticated user's tenant
 * @route   GET /api/projects
 * @access  Private (Authenticated User)
 */
const getProjects = async (req, res, next) => {
  try {
    const { status } = req.query;

    // 1. Build tenant-isolated query
    const query = {
      tenantId: req.user.tenantId,
    };

    // 2. Optional status filter
    if (status) {
      if (!['Active', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status query filter. Must be 'Active' or 'Completed'.",
        });
      }
      query.status = status;
    }

    // 3. Query projects with populated creator and sorted by newest first
    const projects = await Project.find(query)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    // 4. Return results (handles empty results gracefully with count: 0 and empty data array)
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
};
