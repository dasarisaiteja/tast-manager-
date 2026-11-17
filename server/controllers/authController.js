const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'fallback_development_secret_key_12345';
  return jwt.sign(
    {
      id: user._id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

/**
 * @desc    Register a new user (with tenantId)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, role, tenantId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and email.',
      });
    }

    // Auto-generate a new tenantId ObjectId if not provided for easy bootstrapping
    const effectiveTenantId = tenantId || new mongoose.Types.ObjectId();

    // Check if user already exists in this tenant
    const existing = await User.findOne({
      tenantId: effectiveTenantId,
      email: email.toLowerCase().trim(),
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A user with this email already exists in this tenant.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role || 'Employee',
      tenantId: effectiveTenantId,
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login / Generate token for existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, tenantId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email.',
      });
    }

    const query = { email: email.toLowerCase().trim() };
    if (tenantId) query.tenantId = tenantId;

    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users in the authenticated user's tenant
 * @route   GET /api/auth/users
 * @access  Private
 */
const getTenantUsers = async (req, res, next) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId }).select('name email role tenantId');
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Seed demo data for a brand new tenant to quickly preview the dashboard
 * @route   POST /api/auth/demo-seed
 * @access  Public
 */
const seedDemoData = async (req, res, next) => {
  try {
    const Project = require('../models/Project');
    const Task = require('../models/Task');

    const demoTenantId = new mongoose.Types.ObjectId();

    // 1. Create demo users
    const manager = await User.create({
      name: 'Alex Johnson',
      email: `manager_${Date.now()}@acme.inc`,
      role: 'Manager',
      tenantId: demoTenantId,
    });

    const dev1 = await User.create({
      name: 'Sophia Patel',
      email: `sophia_${Date.now()}@acme.inc`,
      role: 'Employee',
      tenantId: demoTenantId,
    });

    const dev2 = await User.create({
      name: 'Marcus Vance',
      email: `marcus_${Date.now()}@acme.inc`,
      role: 'Employee',
      tenantId: demoTenantId,
    });

    // 2. Create demo projects
    const p1 = await Project.create({
      name: 'E-Commerce Mobile App',
      description: 'Flutter and Node.js based shopping application with seamless payment gateway.',
      status: 'Active',
      createdBy: manager._id,
      tenantId: demoTenantId,
    });

    const p2 = await Project.create({
      name: 'Cloud Infrastructure Upgrade',
      description: 'Migrating legacy microservices to Kubernetes clusters and Docker containers.',
      status: 'Completed',
      createdBy: manager._id,
      tenantId: demoTenantId,
    });

    // 3. Create demo tasks
    await Task.create([
      {
        title: 'Design Checkout Flow UI',
        description: 'Create high-fidelity wireframes and Figma components for the multi-step checkout.',
        priority: 'High',
        status: 'In Progress',
        assignedTo: dev1._id,
        projectId: p1._id,
        createdBy: manager._id,
        tenantId: demoTenantId,
      },
      {
        title: 'Integrate Stripe Payment Gateway',
        description: 'Set up Stripe Webhooks, payment intents, and recurring billing subscriptions.',
        priority: 'High',
        status: 'Pending',
        assignedTo: dev2._id,
        projectId: p1._id,
        createdBy: manager._id,
        tenantId: demoTenantId,
      },
      {
        title: 'Setup Kubernetes Ingress Controller',
        description: 'Configure NGINX Ingress with TLS certificates and rate limiting rules.',
        priority: 'Medium',
        status: 'Completed',
        assignedTo: dev2._id,
        projectId: p2._id,
        createdBy: manager._id,
        tenantId: demoTenantId,
      },
      {
        title: 'Write Unit Tests for Order Service',
        description: 'Achieve >85% code coverage for checkout and discount calculations.',
        priority: 'Low',
        status: 'Pending',
        assignedTo: dev1._id,
        projectId: p1._id,
        createdBy: manager._id,
        tenantId: demoTenantId,
      },
    ]);

    const token = generateToken(manager);

    return res.status(201).json({
      success: true,
      message: 'Demo workspace initialized successfully!',
      data: {
        user: manager,
        token,
        tenantId: demoTenantId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getTenantUsers,
  seedDemoData,
};
