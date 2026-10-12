const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // User who made the booking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Car being booked
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  
  // Owner of the car
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Rental period
  rentalPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalDays: {
      type: Number,
      required: true
    }
  },
  
  // Pricing details
  pricing: {
    dailyRate: {
      type: Number,
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Booking status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Contact information
  contactInfo: {
    phone: String,
    email: String,
    notes: String
  },
  
  // Payment information
  payment: {
    method: String,
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ carId: 1 });
bookingSchema.index({ ownerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ 'rentalPeriod.startDate': 1 });
bookingSchema.index({ 'rentalPeriod.endDate': 1 });

// Virtual for booking duration
bookingSchema.virtual('duration').get(function() {
  const start = new Date(this.rentalPeriod.startDate);
  const end = new Date(this.rentalPeriod.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

module.exports = mongoose.model('Booking', bookingSchema);
