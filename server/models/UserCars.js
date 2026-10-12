import mongoose from 'mongoose';

const userCarSchema = new mongoose.Schema({
  // 1. Basic Car Information
  make: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
  
  // 2. Car Type
  type: { 
    type: String, 
    required: true,
    enum: ['sedan', 'suv', 'hatchback', 'coupe', 'convertible', 'truck', 'van', 'luxury']
  },
  
  // 3. Image
  image: { type: String },
  
  // 4. Vehicle Identification
  licensePlate: { type: String, required: true, unique: true },
  vin: { type: String, unique: true, sparse: true },
  
  // 5. Owner Information (User who owns the car for servicing)
  owner: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactPhone: { type: String },
    contactEmail: { type: String }
  },
  
  // 6. Current Mileage
  currentMileage: { type: Number, required: true, min: 0 },
  
  // 7. Service History
  serviceHistory: [{
    serviceDate: { type: Date, required: true },
    serviceType: { 
      type: String, 
      required: true,
      enum: ['oil-change', 'brake-service', 'tire-rotation', 'engine-tune', 'transmission', 'general-maintenance', 'repair', 'inspection']
    },
    description: { type: String, required: true },
    cost: { type: Number, min: 0 },
    mileageAtService: { type: Number, min: 0 },
    serviceProvider: { type: String },
    nextServiceDue: { type: Date },
    notes: { type: String }
  }],
  
  // Service Status
  serviceStatus: {
    type: String,
    enum: ['active', 'in-service', 'needs-service', 'retired'],
    default: 'active'
  },
  
  // Next Service Information
  nextService: {
    dueDate: { type: Date },
    dueMileage: { type: Number },
    serviceType: { type: String },
    isOverdue: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Indexes for better performance
userCarSchema.index({ 'owner.userId': 1 });
userCarSchema.index({ licensePlate: 1 });
userCarSchema.index({ serviceStatus: 1 });
userCarSchema.index({ 'nextService.dueDate': 1 });

// Virtual for full car name
userCarSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Method to check if service is overdue
userCarSchema.methods.checkServiceOverdue = function() {
  if (this.nextService.dueDate && this.nextService.dueDate < new Date()) {
    this.nextService.isOverdue = true;
  }
  if (this.nextService.dueMileage && this.currentMileage >= this.nextService.dueMileage) {
    this.nextService.isOverdue = true;
  }
  return this.nextService.isOverdue;
};

export default mongoose.model('UserCar', userCarSchema);
