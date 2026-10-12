const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // User who submitted the report
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Type of report
  reportType: {
    type: String,
    enum: ['damage', 'accident', 'theft', 'maintenance', 'customer_complaint', 'payment_issue', 'other'],
    required: true
  },
  
  // Related entities
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: false
  },
  
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: false
  },
  
  // Report details
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'declined', 'resolved'],
    default: 'pending'
  },
  
  // Admin processing
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  
  processedAt: {
    type: Date,
    required: false
  },
  
  adminNotes: {
    type: String,
    maxlength: 1000,
    required: false
  },
  
  // Evidence/attachments
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Location if relevant
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  // Incident date/time
  incidentDate: {
    type: Date,
    required: false
  },
  
  // Priority for admin processing
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  }
}, {
  timestamps: true
});

// Indexes for better performance
reportSchema.index({ reporterId: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reportType: 1 });
reportSchema.index({ carId: 1 });
reportSchema.index({ bookingId: 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for days since submission
reportSchema.virtual('daysSinceSubmission').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model('Report', reportSchema);
