const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  name: {
    type: String,
    trim: true,
    default: 'User'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: {
      values: ['customer', 'owner', 'admin'],
      message: 'User type must be either customer, owner, or admin'
    },
    default: 'customer'
  },
  
  // Customer-specific fields
  vehicleDetails: {
    make: String,
    model: String,
    year: Number,
    licensePlate: String,
    vin: String
  },
  
  // Owner-specific fields
  shopDetails: {
    name: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    specialties: [String],
    certifications: [String],
    operatingHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  
  // Service history references
  serviceHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  // For owners - services they've provided
  servicesProvided: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('validate', function(next) {
  // Set default name if not provided
  if (!this.name && this.email) {
    this.name = this.email.split('@')[0];
  }
  next();
});

userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes for better performance (email already has unique: true)
userSchema.index({ userType: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;