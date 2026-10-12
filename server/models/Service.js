import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  // Service identification
  serviceId: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      return 'SRV-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },

  // Relationships
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    index: true
  },

  // Service details
  serviceType: {
    type: String,
    enum: [
      'oilChange',
      'tireReplacement',
      'engineDiagnostics',
      'batteryReplacement',
      'brakeRepair',
      'transmissionService',
      'airConditioningRepair',
      'suspensionCheck',
      'carWashDetailing',
      'generalMaintenance'
    ],
    required: true
  },

  description: {
    type: String,
    required: true,
    maxlength: 1000,
    trim: true
  },

  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Scheduling
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  requestedDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        return date >= new Date();
      },
      message: 'Requested date must be in the future'
    }
  },

  scheduledDate: {
    type: Date,
    validate: {
      validator: function(date) {
        return !date || date >= new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },

  completedDate: {
    type: Date
  },

  // Status tracking
  status: {
    type: String,
    enum: [
      'pending',
      'approved', 
      'declined',
      'completed'
    ],
    default: 'pending',
    index: true
  },

  // Pricing and payment
  estimatedCost: {
    type: Number,
    min: 0,
    default: 0
  },

  actualCost: {
    type: Number,
    min: 0
  },

  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },

  // Location and logistics
  serviceLocation: {
    type: {
      type: String,
      enum: ['pickup', 'dropoff', 'mobile', 'garage'],
      default: 'garage'
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'USA' }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Communication and notes
  customerNotes: {
    type: String,
    maxlength: 500,
    trim: true
  },

  ownerNotes: {
    type: String,
    maxlength: 500,
    trim: true
  },

  internalNotes: {
    type: String,
    maxlength: 1000,
    trim: true
  },

  // Service history and tracking
  serviceHistory: [{
    action: {
      type: String,
      required: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Attachments and documentation
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Rating and feedback
  rating: {
    customerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    ownerRating: {
      type: Number,
      min: 1,
      max: 5
    },
    customerFeedback: {
      type: String,
      maxlength: 500
    },
    ownerFeedback: {
      type: String,
      maxlength: 500
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceSchema.index({ customerId: 1, status: 1 });
serviceSchema.index({ ownerId: 1, status: 1 });
serviceSchema.index({ car: 1 });
serviceSchema.index({ serviceType: 1, status: 1 });
serviceSchema.index({ requestedDate: 1 });
serviceSchema.index({ scheduledDate: 1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for service duration (if completed)
serviceSchema.virtual('serviceDuration').get(function() {
  if (this.completedDate && this.scheduledDate) {
    return Math.ceil((this.completedDate - this.scheduledDate) / (1000 * 60 * 60)); // hours
  }
  return null;
});

// Virtual for days until service
serviceSchema.virtual('daysUntilService').get(function() {
  if (this.scheduledDate) {
    const now = new Date();
    const diffTime = this.scheduledDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Pre-save middleware to add service history entry
serviceSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.serviceHistory.push({
      action: `Status changed to ${this.status}`,
      performedBy: this.modifiedBy || this.ownerId,
      timestamp: new Date(),
      notes: `Service status updated to ${this.status}`
    });
  }
  next();
});

// Static methods for common queries
serviceSchema.statics.findByCustomer = function(customerId, status = null) {
  const query = { customerId: customerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('ownerId', 'email userType name shopDetails')
    .populate('car', 'make model year licensePlate')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.findByOwner = function(ownerId, status = null) {
  const query = { ownerId: ownerId };
  if (status) query.status = status;
  
  return this.find(query)
    .populate('customerId', 'email name vehicleDetails')
    .populate('car', 'make model year licensePlate')
    .sort({ createdAt: -1 });
};

serviceSchema.statics.findPendingServices = function() {
  return this.find({ status: 'pending' })
    .populate('customerId', 'email name vehicleDetails')
    .populate('ownerId', 'email name shopDetails')
    .populate('car', 'make model year licensePlate')
    .sort({ requestedDate: 1 });
};

// Instance methods
serviceSchema.methods.updateStatus = function(newStatus, userId, notes = '') {
  this.status = newStatus;
  this.modifiedBy = userId;
  
  if (newStatus === 'completed') {
    this.completedDate = new Date();
  }
  
  this.serviceHistory.push({
    action: `Status changed to ${newStatus}`,
    performedBy: userId,
    timestamp: new Date(),
    notes: notes
  });
  
  return this.save();
};

serviceSchema.methods.addNote = function(note, userId, type = 'internal') {
  const noteField = type === 'customer' ? 'customerNotes' : 
                   type === 'owner' ? 'ownerNotes' : 'internalNotes';
  
  this[noteField] = note;
  
  this.serviceHistory.push({
    action: `Added ${type} note`,
    performedBy: userId,
    timestamp: new Date(),
    notes: `Note added: ${note.substring(0, 50)}...`
  });
  
  return this.save();
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
