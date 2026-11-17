const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [150, 'Project name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      required: [true, 'Project status is required'],
      enum: {
        values: ['Active', 'Completed'],
        message: '{VALUE} is not a valid project status',
      },
      default: 'Active',
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

// Virtual relationship to populate all tasks under this project
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
});

// Indexes for query optimization
// 1. Filtering active/completed projects per tenant
projectSchema.index({ tenantId: 1, status: 1 });

// 2. Listing projects created by a user per tenant
projectSchema.index({ tenantId: 1, createdBy: 1 });

// 3. Sorting projects by latest creation date per tenant
projectSchema.index({ tenantId: 1, createdAt: -1 });

// 4. (Optional) Prevent duplicate project names within the same tenant
projectSchema.index({ tenantId: 1, name: 1 }, { unique: true });

// Pre-save validation: Ensure createdBy user belongs to the same tenant
projectSchema.pre('save', async function () {
  if (this.isModified('createdBy') || this.isNew) {
    const user = await mongoose.model('User').findById(this.createdBy);
    if (!user) {
      throw new Error('Invalid createdBy reference: User does not exist.');
    }
    if (user.tenantId.toString() !== this.tenantId.toString()) {
      throw new Error('Cross-tenant reference violation: createdBy user does not belong to the same tenant.');
    }
  }
});

module.exports = mongoose.model('Project', projectSchema);
