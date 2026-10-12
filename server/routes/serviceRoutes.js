import express from 'express';
import Service from '../models/Service.js';
import User from '../models/user.js';
import Car from '../models/Cars.js';
import { authenticateToken, requireRole, requireOwnership, extractUserId } from '../middleware/auth.js';

const router = express.Router();

// Validation helper function
const validateServiceData = (data) => {
  const errors = [];
  
  if (!data.customerId) errors.push('Customer ID is required');
  if (!data.ownerId) errors.push('Owner ID is required');
  if (!data.car) errors.push('Car ID is required');
  if (!data.serviceType) errors.push('Service type is required');
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!data.requestedDate) errors.push('Requested date is required');
  
  const requestedDate = new Date(data.requestedDate);
  if (requestedDate <= new Date()) {
    errors.push('Requested date must be in the future');
  }
  
  return errors;
};

// POST /api/services - Create a new service request
router.post('/', extractUserId, async (req, res) => {
  try {
    const validationErrors = validateServiceData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Verify that customer, owner, and car exist
    const [customer, owner, car] = await Promise.all([
      User.findById(req.body.customerId),
      User.findById(req.body.ownerId),
      Car.findById(req.body.car)
    ]);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      });
    }

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Verify that the car belongs to the owner
    if (car.ownerId.toString() !== owner._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Car does not belong to the specified owner'
      });
    }

    // Create the service request
    const service = new Service({
      ...req.body,
      serviceHistory: [{
        action: 'Service request created',
        performedBy: req.userId || req.body.customerId,
        timestamp: new Date(),
        notes: 'Initial service request submitted'
      }]
    });

    await service.save();

    // Populate the response with related data
    await service.populate([
      { path: 'customerId', select: 'email userType name vehicleDetails' },
      { path: 'ownerId', select: 'email userType name shopDetails' },
      { path: 'car', select: 'make model year licensePlate images' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      service
    });

  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service request',
      error: error.message
    });
  }
});

// GET /api/services - List all service requests with filters
router.get('/', extractUserId, async (req, res) => {
  try {
    const {
      status,
      serviceType,
      customer,
      owner,
      urgency,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};
    
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (customer) query.customerId = customer;
    if (owner) query.ownerId = owner;
    if (urgency) query.urgency = urgency;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    // Execute query with population and pagination
    const [services, totalCount] = await Promise.all([
      Service.find(query)
        .populate('customerId', 'email userType name vehicleDetails')
        .populate('ownerId', 'email userType name shopDetails')
        .populate('car', 'make model year licensePlate images pricing')
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit)),
      Service.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      services,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
});

// GET /api/services/customer/:customerId - Get services for a specific customer
router.get('/customer/:customerId', extractUserId, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query;

    const services = await Service.findByCustomer(customerId, status);

    res.json({
      success: true,
      services,
      count: services.length
    });

  } catch (error) {
    console.error('Error fetching customer services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer services',
      error: error.message
    });
  }
});

// GET /api/services/owner/:ownerId - Get services for a specific owner
router.get('/owner/:ownerId', extractUserId, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { status } = req.query;

    const services = await Service.findByOwner(ownerId, status);

    res.json({
      success: true,
      services,
      count: services.length
    });

  } catch (error) {
    console.error('Error fetching owner services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch owner services',
      error: error.message
    });
  }
});

// GET /api/services/pending - Get all pending service requests
router.get('/pending', extractUserId, async (req, res) => {
  try {
    const services = await Service.findPendingServices();

    res.json({
      success: true,
      services,
      count: services.length
    });

  } catch (error) {
    console.error('Error fetching pending services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending services',
      error: error.message
    });
  }
});

// GET /api/services/:id - Get a specific service request
router.get('/:id', extractUserId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('customerId', 'email userType name vehicleDetails')
      .populate('ownerId', 'email userType name shopDetails')
      .populate('car', 'make model year licensePlate images pricing location')
      .populate('serviceHistory.performedBy', 'email userType');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    res.json({
      success: true,
      service
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
});

// PUT /api/services/:id - Update a service request
router.put('/:id', extractUserId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check if user has permission to update this service
    const userId = req.userId.toString();
    const isCustomer = service.customerId.toString() === userId;
    const isOwner = service.ownerId.toString() === userId;

    if (!isCustomer && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this service request'
      });
    }

    // Restrict what customers vs owners can update
    const allowedCustomerFields = ['customerNotes', 'urgency'];
    const allowedOwnerFields = ['status', 'scheduledDate', 'estimatedCost', 'actualCost', 'ownerNotes', 'serviceLocation'];
    
    const updateData = {};
    
    if (isCustomer) {
      // Customers can only update certain fields
      allowedCustomerFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
    }
    
    if (isOwner) {
      // Owners can update more fields
      allowedOwnerFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });
    }

    // Add to service history if status is being changed
    if (updateData.status && updateData.status !== service.status) {
      service.serviceHistory.push({
        action: `Status changed from ${service.status} to ${updateData.status}`,
        performedBy: userId,
        timestamp: new Date(),
        notes: req.body.statusNote || `Status updated by ${isOwner ? 'owner' : 'customer'}`
      });
    }

    // Update the service
    Object.assign(service, updateData);
    
    if (updateData.status === 'completed') {
      service.completedDate = new Date();
    }

    await service.save();

    // Populate and return updated service
    await service.populate([
      { path: 'customerId', select: 'email userType name vehicleDetails' },
      { path: 'ownerId', select: 'email userType name shopDetails' },
      { path: 'car', select: 'make model year licensePlate images' }
    ]);

    res.json({
      success: true,
      message: 'Service request updated successfully',
      service
    });

  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service request',
      error: error.message
    });
  }
});

// PUT /api/services/:id/status - Update service status (separate endpoint for clarity)
router.put('/:id/status', extractUserId, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check permissions - only owner can change status in most cases
    const userId = req.userId.toString();
    const isOwner = service.ownerId.toString() === userId;
    const isCustomer = service.customerId.toString() === userId;

    // Customers can only cancel their own requests
    if (isCustomer && status !== 'cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Customers can only cancel service requests'
      });
    }

    // Owners can change most statuses
    if (!isOwner && !isCustomer) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this service request'
      });
    }

    await service.updateStatus(status, userId, notes);

    await service.populate([
      { path: 'customerId', select: 'email userType name vehicleDetails' },
      { path: 'ownerId', select: 'email userType name shopDetails' },
      { path: 'car', select: 'make model year licensePlate' }
    ]);

    res.json({
      success: true,
      message: 'Service status updated successfully',
      service
    });

  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service status',
      error: error.message
    });
  }
});

// DELETE /api/services/:id - Delete a service request
router.delete('/:id', extractUserId, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    // Check permissions - only customer or owner can delete
    const userId = req.userId.toString();
    const isCustomer = service.customerId.toString() === userId;
    const isOwner = service.ownerId.toString() === userId;

    if (!isCustomer && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this service request'
      });
    }

    // Don't allow deletion of completed services (for record keeping)
    if (service.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete completed service requests'
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service request deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service request',
      error: error.message
    });
  }
});

// POST /api/services/:id/rating - Add rating and feedback
router.post('/:id/rating', extractUserId, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found'
      });
    }

    if (service.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed services'
      });
    }

    const userId = req.userId.toString();
    const isCustomer = service.customer.toString() === userId;
    const isOwner = service.owner.toString() === userId;

    if (!isCustomer && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to rate this service'
      });
    }

    // Update rating based on who is rating
    if (isCustomer) {
      service.rating.customerRating = rating;
      service.rating.customerFeedback = feedback;
    } else if (isOwner) {
      service.rating.ownerRating = rating;
      service.rating.ownerFeedback = feedback;
    }

    service.serviceHistory.push({
      action: `Rating submitted by ${isCustomer ? 'customer' : 'owner'}`,
      performedBy: userId,
      timestamp: new Date(),
      notes: `${rating} stars - ${feedback?.substring(0, 50) || 'No feedback'}`
    });

    await service.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      service
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: error.message
    });
  }
});

export default router;
