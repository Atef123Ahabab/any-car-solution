import express from 'express';
import UserCar from '../models/UserCars.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/user-cars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Add new user car for servicing
router.post('/add-car', upload.single('image'), async (req, res) => {
  try {
    const carData = req.body;
    
    // Process uploaded image
    const image = req.file ? `/uploads/user-cars/${req.file.filename}` : '';
    
    const newUserCar = new UserCar({
      make: carData.make,
      model: carData.model,
      year: parseInt(carData.year),
      type: carData.type,
      image,
      licensePlate: carData.licensePlate,
      vin: carData.vin,
      currentMileage: parseInt(carData.currentMileage),
      owner: {
        userId: carData.userId,
        contactPhone: carData.contactPhone,
        contactEmail: carData.contactEmail
      }
    });
    
    const savedCar = await newUserCar.save();
    
    console.log('🚗 New user car added for servicing:', {
      id: savedCar._id,
      name: savedCar.fullName,
      owner: savedCar.owner.userId,
      licensePlate: savedCar.licensePlate,
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      message: 'Car added successfully for servicing',
      car: savedCar
    });
  } catch (error) {
    console.error('❌ Add user car error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add car'
    });
  }
});

// Get user cars by owner
router.get('/my-cars/:userId', async (req, res) => {
  try {
    const cars = await UserCar.find({ 'owner.userId': req.params.userId })
      .populate('owner.userId', 'email name')
      .sort({ createdAt: -1 });
    
    // Check for overdue services
    cars.forEach(car => car.checkServiceOverdue());
    
    res.json({
      success: true,
      cars
    });
  } catch (error) {
    console.error('❌ Get user cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars'
    });
  }
});

// Create new service request
router.post('/create-service', async (req, res) => {
  try {
    const serviceData = req.body;
    const userId = req.headers['x-user-id'] || serviceData.customerId;
    
    // Create new service request
    const newService = {
      customerId: userId,
      ownerId: serviceData.ownerId || '507f1f77bcf86cd799439011', // Default service provider
      car: serviceData.car || serviceData.vehicleId,
      serviceType: serviceData.serviceType,
      description: serviceData.description,
      urgency: serviceData.urgency || 'medium',
      requestedDate: new Date(serviceData.requestedDate),
      estimatedCost: parseFloat(serviceData.estimatedCost) || 0,
      serviceLocation: serviceData.serviceLocation || { type: 'garage' },
      customerNotes: serviceData.customerNotes || '',
      status: 'pending'
    };
    
    console.log('🔧 New service request created:', {
      serviceId: newService.serviceId,
      serviceType: newService.serviceType,
      customer: userId,
      timestamp: new Date().toISOString()
    });
    
    // For now, return success with mock data
    // In production, this would save to Service model
    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      service: {
        ...newService,
        _id: 'service_' + Date.now(),
        serviceId: 'SRV-' + Date.now(),
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Create service request error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create service request'
    });
  }
});

// Add service record
router.post('/add-service/:carId', async (req, res) => {
  try {
    const { carId } = req.params;
    const serviceData = req.body;
    
    const car = await UserCar.findById(carId);
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    // Add service record
    car.serviceHistory.push({
      serviceDate: new Date(serviceData.serviceDate),
      serviceType: serviceData.serviceType,
      description: serviceData.description,
      cost: parseFloat(serviceData.cost) || 0,
      mileageAtService: parseInt(serviceData.mileageAtService),
      serviceProvider: serviceData.serviceProvider,
      nextServiceDue: serviceData.nextServiceDue ? new Date(serviceData.nextServiceDue) : null,
      notes: serviceData.notes
    });
    
    // Update current mileage if provided
    if (serviceData.mileageAtService && serviceData.mileageAtService > car.currentMileage) {
      car.currentMileage = parseInt(serviceData.mileageAtService);
    }
    
    // Update next service information
    if (serviceData.nextServiceDue) {
      car.nextService.dueDate = new Date(serviceData.nextServiceDue);
      car.nextService.serviceType = serviceData.nextServiceType || 'general-maintenance';
    }
    
    const updatedCar = await car.save();
    
    console.log('🔧 Service record added:', {
      carId: updatedCar._id,
      serviceType: serviceData.serviceType,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Service record added successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('❌ Add service record error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to add service record'
    });
  }
});

// Get service history for a car
router.get('/service-history/:carId', async (req, res) => {
  try {
    const car = await UserCar.findById(req.params.carId)
      .populate('owner.userId', 'email name');
    
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    res.json({
      success: true,
      car: {
        _id: car._id,
        fullName: car.fullName,
        licensePlate: car.licensePlate,
        currentMileage: car.currentMileage,
        serviceHistory: car.serviceHistory.sort((a, b) => new Date(b.serviceDate) - new Date(a.serviceDate)),
        nextService: car.nextService
      }
    });
  } catch (error) {
    console.error('❌ Get service history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service history'
    });
  }
});

// Update car mileage
router.patch('/update-mileage/:carId', async (req, res) => {
  try {
    const { currentMileage } = req.body;
    
    const updatedCar = await UserCar.findByIdAndUpdate(
      req.params.carId,
      { currentMileage: parseInt(currentMileage) },
      { new: true }
    );
    
    if (!updatedCar) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }
    
    // Check if service is now overdue
    updatedCar.checkServiceOverdue();
    await updatedCar.save();
    
    res.json({
      success: true,
      message: 'Mileage updated successfully',
      car: updatedCar
    });
  } catch (error) {
    console.error('❌ Update mileage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update mileage'
    });
  }
});

// Get cars needing service (overdue or due soon)
router.get('/service-due/:userId', async (req, res) => {
  try {
    const cars = await UserCar.find({ 'owner.userId': req.params.userId })
      .populate('owner.userId', 'email name');
    
    const carsDue = cars.filter(car => {
      car.checkServiceOverdue();
      return car.nextService.isOverdue || 
             (car.nextService.dueDate && car.nextService.dueDate <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Due within 30 days
    });
    
    res.json({
      success: true,
      cars: carsDue
    });
  } catch (error) {
    console.error('❌ Get service due cars error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cars due for service'
    });
  }
});

// Get service requests by customer email
router.get('/customer-services/:email', async (req, res) => {
  try {
    const customerEmail = req.params.email;
    
    // Mock service data associated with email
    const mockServices = [
      {
        _id: 'service_001',
        serviceId: 'SRV-001',
        serviceType: 'oilChange',
        status: 'pending',
        description: 'Regular oil change service',
        urgency: 'medium',
        requestedDate: new Date().toISOString(),
        estimatedCost: 50,
        customerEmail: customerEmail,
        vehicleDetails: {
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          licensePlate: 'ABC-123'
        },
        serviceLocation: { type: 'garage' },
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      services: mockServices,
      count: mockServices.length
    });
  } catch (error) {
    console.error('❌ Get customer services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer services'
    });
  }
});

// Update service status
router.put('/update-service-status/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { status, notes } = req.body;
    const userId = req.headers['x-user-id'];
    
    console.log('🔄 Service status update:', {
      serviceId,
      newStatus: status,
      updatedBy: userId,
      timestamp: new Date().toISOString()
    });
    
    // Mock successful update
    res.json({
      success: true,
      message: `Service status updated to ${status}`,
      service: {
        _id: serviceId,
        status: status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Update service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service status'
    });
  }
});

export default router;
