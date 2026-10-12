const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking.js');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// Get all bookings for a car owner
router.get('/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const bookings = await Booking.find({ ownerId })
      .populate('userId', 'name email phone')
      .populate('carId', 'make model year type dailyRate images')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get all bookings for a customer
router.get('/customer/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const bookings = await Booking.find({ userId })
      .populate('carId', 'make model year type dailyRate images location')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get a specific booking
router.get('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('carId', 'make model year type dailyRate images location')
      .populate('ownerId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking' });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const {
      carId,
      ownerId,
      rentalPeriod,
      pricing,
      contactInfo
    } = req.body;

    const userId = req.body.userId; // Get from request body instead

    const booking = new Booking({
      userId,
      carId,
      ownerId,
      rentalPeriod,
      pricing,
      contactInfo,
      status: 'pending'
    });

    await booking.save();
    
    const populatedBooking = await Booking.findById(booking._id)
      .populate('userId', 'name email phone')
      .populate('carId', 'make model year type dailyRate images')
      .populate('ownerId', 'name email phone');

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Update booking status
router.patch('/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Note: Authentication check removed for testing
    // In production, add proper authorization checks

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(bookingId)
      .populate('userId', 'name email phone')
      .populate('carId', 'make model year type dailyRate images')
      .populate('ownerId', 'name email phone');

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Delete a booking
router.delete('/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Note: Authentication check removed for testing
    // In production, add proper authorization checks

    await Booking.findByIdAndDelete(bookingId);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ message: 'Failed to delete booking' });
  }
});

// Get booking statistics for owner dashboard
router.get('/stats/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;

    const stats = await Booking.aggregate([
      { $match: { ownerId: mongoose.Types.ObjectId(ownerId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.totalAmount' }
        }
      }
    ]);

    const totalBookings = await Booking.countDocuments({ ownerId });
    const totalRevenue = await Booking.aggregate([
      { $match: { ownerId: mongoose.Types.ObjectId(ownerId) } },
      { $group: { _id: null, total: { $sum: '$pricing.totalAmount' } } }
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ message: 'Failed to fetch booking statistics' });
  }
});

module.exports = router;
