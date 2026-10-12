import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/user.js';
import Car from '../models/Cars.js';

export const seedBookings = async () => {
  try {
    // Check if bookings already exist
    const existingBookings = await Booking.countDocuments();
    if (existingBookings > 0) {
      console.log('📊 Bookings already exist, skipping seed');
      return;
    }

    // Get some users and cars for sample data
    const users = await User.find().limit(3);
    const cars = await Car.find().limit(5);
    
    if (users.length === 0 || cars.length === 0) {
      console.log('⚠️ No users or cars found, cannot seed bookings');
      return;
    }

    const sampleBookings = [
      {
        userId: users[0]._id,
        carId: cars[0]._id,
        ownerId: cars[0].ownerId,
        rentalPeriod: {
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-18'),
          totalDays: 3
        },
        pricing: {
          dailyRate: 50,
          totalAmount: 150,
          currency: 'USD'
        },
        status: 'confirmed',
        contactInfo: {
          phone: '+1234567890',
          email: users[0].email,
          notes: 'Airport pickup requested'
        },
        payment: {
          method: 'credit_card',
          status: 'paid'
        }
      },
      {
        userId: users[1]._id,
        carId: cars[1]._id,
        ownerId: cars[1].ownerId,
        rentalPeriod: {
          startDate: new Date('2024-01-20'),
          endDate: new Date('2024-01-25'),
          totalDays: 5
        },
        pricing: {
          dailyRate: 75,
          totalAmount: 375,
          currency: 'USD'
        },
        status: 'pending',
        contactInfo: {
          phone: '+1234567891',
          email: users[1].email,
          notes: 'Business trip rental'
        },
        payment: {
          method: 'debit_card',
          status: 'pending'
        }
      },
      {
        userId: users[2]._id,
        carId: cars[2]._id,
        ownerId: cars[2].ownerId,
        rentalPeriod: {
          startDate: new Date('2024-01-10'),
          endDate: new Date('2024-01-12'),
          totalDays: 2
        },
        pricing: {
          dailyRate: 60,
          totalAmount: 120,
          currency: 'USD'
        },
        status: 'completed',
        contactInfo: {
          phone: '+1234567892',
          email: users[2].email,
          notes: 'Weekend getaway'
        },
        payment: {
          method: 'paypal',
          status: 'paid'
        }
      },
      {
        userId: users[0]._id,
        carId: cars[3]._id,
        ownerId: cars[3].ownerId,
        rentalPeriod: {
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-02-07'),
          totalDays: 6
        },
        pricing: {
          dailyRate: 80,
          totalAmount: 480,
          currency: 'USD'
        },
        status: 'active',
        contactInfo: {
          phone: '+1234567890',
          email: users[0].email,
          notes: 'Extended vacation rental'
        },
        payment: {
          method: 'credit_card',
          status: 'paid'
        }
      },
      {
        userId: users[1]._id,
        carId: cars[4]._id,
        ownerId: cars[4].ownerId,
        rentalPeriod: {
          startDate: new Date('2024-01-28'),
          endDate: new Date('2024-01-30'),
          totalDays: 2
        },
        pricing: {
          dailyRate: 45,
          totalAmount: 90,
          currency: 'USD'
        },
        status: 'cancelled',
        contactInfo: {
          phone: '+1234567891',
          email: users[1].email,
          notes: 'Plans changed'
        },
        payment: {
          method: 'credit_card',
          status: 'refunded'
        }
      }
    ];

    await Booking.insertMany(sampleBookings);
    console.log('✅ Sample bookings created successfully');
    
    const bookingCount = await Booking.countDocuments();
    console.log(`📊 Total bookings in database: ${bookingCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
  }
};
