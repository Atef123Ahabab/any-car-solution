// routes/userRoutes.js
import express from 'express';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Helper function to log queries
const logQuery = (operation, query, additionalData = {}) => {
  console.log('📝 DATABASE QUERY:');
  console.log('====================');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log(`🔧 Operation: ${operation}`);
  console.log(`🔍 Query:`, query);
  if (Object.keys(additionalData).length > 0) {
    console.log(`📊 Additional Data:`, additionalData);
  }
  console.log('====================\n');
};

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType = 'customer' } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Check if user exists with query logging
    const findQuery = { email };
    logQuery('FIND_USER', findQuery);
    const existingUser = await User.findOne(findQuery);
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create new user with query logging
    const newUser = { 
      email, 
      password, 
      userType 
    };
    logQuery('CREATE_USER', {}, newUser);
    
    const user = new User(newUser);
    await user.save();

    // Registration success log
    console.log('🎉 NEW USER REGISTERED:');
    console.log('========================');
    console.log(`📧 Email: ${user.email}`);
    console.log(`👤 User Type: ${user.userType}`);
    console.log(`🆔 User ID: ${user._id}`);
    console.log(`⏰ Registered At: ${user.createdAt}`);
    console.log('========================\n');

    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: {
        email: user.email,
        userType: user.userType,
        id: user._id
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user with query logging
    const findQuery = { email };
    logQuery('FIND_USER', findQuery);
    const user = await User.findOne(findQuery);
    
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Compare password with logging
    logQuery('COMPARE_PASSWORD', { userId: user._id });
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Login success log
    console.log(`✅ User logged in: ${user.email} (ID: ${user._id}) at ${new Date().toISOString()}`);

    res.json({ 
      success: true,
      message: 'Login successful',
      user: {
        email: user.email,
        userType: user.userType,
        id: user._id
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all users (for debugging - remove in production)
router.get('/debug/users', async (req, res) => {
  try {
    logQuery('FIND_ALL_USERS', {});
    const users = await User.find({});
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

export default router;