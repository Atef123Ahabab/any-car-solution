const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token and extract user info
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check if user has required role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Middleware to check if user is owner of a resource
const requireOwnership = (resourceField = 'owner') => {
  return (req, res, next) => {
    // This will be used in route handlers to check ownership
    req.checkOwnership = (resource) => {
      const resourceOwnerId = resource[resourceField]?.toString();
      const userId = req.user._id.toString();
      
      return resourceOwnerId === userId || req.user.userType === 'admin';
    };
    
    next();
  };
};

// Middleware to extract user ID from various sources
const extractUserId = (req, res, next) => {
  // Try to get user ID from authenticated user first
  if (req.user) {
    req.userId = req.user._id;
    return next();
  }

  // Fallback to localStorage userId (for development/testing)
  const userIdFromHeader = req.headers['x-user-id'];
  if (userIdFromHeader) {
    req.userId = userIdFromHeader;
    return next();
  }

  return res.status(401).json({ 
    success: false, 
    message: 'User identification required' 
  });
};

module.exports = {
  authenticateToken,
  requireRole,
  requireOwnership,
  extractUserId
};
