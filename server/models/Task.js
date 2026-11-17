const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Optional at creation; can be assigned later
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Project ID is required'],
      ref: 'Project',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Creator User ID (createdBy) is required'],
      ref: 'User',
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Tenant ID is required'],
      ref: 'Tenant',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for query optimization
// 1. Kanban Board & Project Task Views: Filter tasks by project and status
taskSchema.index({ tenantId: 1, projectId: 1, status: 1 });

// 2. "My Tasks" View: Filter tasks assigned to a specific user
taskSchema.index({ tenantId: 1, assignedTo: 1, status: 1 });

// 3. Priority Queue & Filtering: Filter and sort by priority and status
taskSchema.index({ tenantId: 1, status: 1, priority: 1 });

// 4. Activity feeds & recent task listings
taskSchema.index({ tenantId: 1, createdAt: -1 });

// 5. Duplicate Prevention: Disallow tasks with the exact same title in the same project
taskSchema.index({ projectId: 1, title: 1 }, { unique: true });

// Pre-save validation: Guarantee referential integrity & tenant isolation
taskSchema.pre('save', async function () {
  const UserModel = mongoose.model('User');
  const ProjectModel = mongoose.model('Project');

  // 1. Validate Project reference
  if (this.isModified('projectId') || this.isNew) {
    const project = await ProjectModel.findById(this.projectId);
    if (!project) {
      throw new Error('Invalid projectId: Project does not exist.');
    }
    if (project.tenantId.toString() !== this.tenantId.toString()) {
      throw new Error('Cross-tenant violation: Project does not belong to the same tenant.');
    }
  }

  // 2. Validate createdBy User reference
  if (this.isModified('createdBy') || this.isNew) {
    const creator = await UserModel.findById(this.createdBy);
    if (!creator) {
      throw new Error('Invalid createdBy: User does not exist.');
    }
    if (creator.tenantId.toString() !== this.tenantId.toString()) {
      throw new Error('Cross-tenant violation: createdBy user does not belong to the same tenant.');
    }
  }

  // 3. Validate assignedTo User reference (if assigned)
  if ((this.isModified('assignedTo') || this.isNew) && this.assignedTo) {
    const assignee = await UserModel.findById(this.assignedTo);
    if (!assignee) {
      throw new Error('Invalid assignedTo: User does not exist.');
    }
    if (assignee.tenantId.toString() !== this.tenantId.toString()) {
      throw new Error('Cross-tenant violation: assignedTo user does not belong to the same tenant.');
    }
  }
});

module.exports = mongoose.model('Task', taskSchema);
