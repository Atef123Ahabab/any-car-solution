// Example backend endpoint for registration using MongoDB
// This would go in your server file (e.g., server.js or routes/auth.js)

const express = require('express');
const bcrypt = require('bcrypt'); // For password hashing
const mongoose = require('mongoose');
const router = express.Router();

// User Schema (create this in a separate file like models/User.js)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    required: true,
    enum: ['customer', 'owner', 'admin'],
    default: 'customer'
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

const User = mongoose.model('User', userSchema);

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType
    });
    
    // Save user to database
    const savedUser = await newUser.save();
    
    // Success response (don't send back the password)
    res.status(201).json({ 
      message: 'User registered successfully',
      userId: savedUser._id,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        userType: savedUser.userType,
        createdAt: savedUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'User already exists with this email' 
      });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;