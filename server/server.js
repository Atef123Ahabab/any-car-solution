const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const upload = require('./middleware/upload');
const { authenticateToken, requireRole } = require('./middleware/auth');
const User = require('./models/user');
const Car = require('./models/Cars');
const Booking = require('./models/Booking');
const Report = require('./models/Report');
const { Message, Conversation } = require('./models/chat');
const SearchHistory = require('./models/SearchHistory.js');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require("./routes/bookingRoutes.js");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      // Add your Render frontend URL here
      "https://carrent-main-main.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://carrental-and-service.onrender.com',
    // Add your actual frontend URL here
    'https://carrent-main-main.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'CarRent API is running'
  });
});

// Routes
app.use("/api/auth", authRoutes);

// MongoDB connection with retry logic
const connectDB = async () => {
  const maxRetries = 5;
  const retryDelay = 5000;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the provided MongoDB Atlas connection string
    const mongoUri = process.env.MONGODB_URI;
      
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        heartbeatFrequencyMS: 10000,
      };

      await mongoose.connect(mongoUri, options);
      
      console.log(`MongoDB connected successfully on attempt ${attempt}`);
      console.log(`Database: ${mongoose.connection.db.databaseName}`);
      console.log(`Connection state: ${mongoose.connection.readyState}`);
      return;
      
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('All MongoDB connection attempts failed');
        process.exit(1);
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

// Initialize database connection
connectDB();

// Get all cars route
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await Car.find({}).sort({ createdAt: -1 });
    console.log(`Found ${cars.length} cars in database`);
    res.json({ success: true, cars: cars, count: cars.length });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ success: false, error: error.message, cars: [], count: 0 });
  }
});

// Get cars by owner ID
app.get("/api/cars/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const cars = await Car.find({ ownerId: ownerId }).sort({ createdAt: -1 });
    res.json({ cars });
  } catch (error) {
    console.error('Error fetching owner cars:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get individual car by ID
app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json({ success: true, car });
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new car
app.post("/api/cars", async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get statistics for dashboard
app.get("/api/statistics", async (req, res) => {
  try {
    // Get all cars
    const totalCars = await Car.countDocuments();
    
    // Get all bookings
    const totalBookings = await Booking.countDocuments();
    
    // Get active bookings (currently rented cars)
    const currentDate = new Date();
    const activeBookings = await Booking.find({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      status: { $in: ['active', 'confirmed'] }
    })
    .populate('car', 'make model year licensePlate images pricing')
    .populate('user', 'email')
    .sort({ startDate: -1 });
    
    // Calculate total revenue from all bookings
    const allBookings = await Booking.find({});
    const totalRevenue = allBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    
    // Count available cars (not currently rented)
    const rentedCarIds = activeBookings.map(booking => booking.car._id);
    const availableCars = await Car.countDocuments({
      _id: { $nin: rentedCarIds },
      'availability.isAvailable': true
    });
    
    const rentedCars = activeBookings.length;

    res.json({
      totalCars,
      totalBookings,
      totalRevenue,
      availableCars,
      rentedCars,
      activeBookings
    });
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoints
// Create a new booking
app.post("/api/bookings", async (req, res) => {
  try {
    const {
      userId,
      carId,
      customerName,
      customerEmail,
      customerPhone,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation,
      rentalDuration,
      pricing,
      specialRequests
    } = req.body;

    // Get car details to find owner
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    // Create booking with proper structure
    const bookingData = {
      userId: userId,
      carId: carId,
      ownerId: car.ownerId,
      rentalPeriod: {
        startDate: new Date(pickupDate),
        endDate: new Date(returnDate),
        totalDays: rentalDuration
      },
      pricing: {
        dailyRate: pricing.dailyRate,
        totalAmount: pricing.totalCost,
        currency: 'USD'
      },
      contactInfo: {
        phone: customerPhone,
        email: customerEmail,
        notes: specialRequests || ''
      },
      status: 'pending'
    };

    const booking = new Booking(bookingData);
    await booking.save();
    
    // Update car availability
    await Car.findByIdAndUpdate(carId, {
      'availability.isAvailable': false
    });
    
    console.log('New booking created:', booking._id);
    res.status(201).json({ success: true, booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get bookings for a specific user
app.get("/api/bookings/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ userId })
      .populate('carId')
      .populate('ownerId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for cars owned by a specific owner
app.get("/api/bookings/owner/:ownerId", async (req, res) => {
  try {
    const { ownerId } = req.params;
    const bookings = await Booking.find({ ownerId })
      .populate('carId')
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.patch("/api/bookings/:bookingId/status", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate(['carId', 'userId', 'ownerId']);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
app.delete("/api/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByIdAndDelete(bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update car availability
app.patch("/api/cars/:carId/availability", async (req, res) => {
  try {
    const { carId } = req.params;
    const { isAvailable } = req.body;
    
    const car = await Car.findByIdAndUpdate(
      carId,
      { 'availability.isAvailable': isAvailable },
      { new: true }
    );
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    res.json({ success: true, car });
  } catch (error) {
    console.error('Error updating car availability:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete car
app.delete("/api/cars/:carId", async (req, res) => {
  try {
    const { carId } = req.params;
    const car = await Car.findByIdAndDelete(carId);
    
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    // Also delete related bookings
    await Booking.deleteMany({ carId });
    
    res.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ error: error.message });
  }
});

// Search cars with filters and history tracking
app.post("/api/cars/search", async (req, res) => {
  try {
    const { 
      query, 
      location, 
      pickupDate, 
      returnDate, 
      carType, 
      priceRange,
      userId,
      userEmail 
    } = req.body;

    // Build search filter
    let searchFilter = {};
    
    // Text search across make, model, and type
    if (query && query.trim()) {
      searchFilter.$or = [
        { make: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } }
      ];
    }

    // Location filter
    if (location) {
      searchFilter.$or = [
        ...(searchFilter.$or || []),
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } }
      ];
    }

    // Car type filter
    if (carType) {
      searchFilter.type = { $regex: carType, $options: 'i' };
    }

    // Price range filter
    if (priceRange && (priceRange.min || priceRange.max)) {
      searchFilter['pricing.dailyRate'] = {};
      if (priceRange.min) searchFilter['pricing.dailyRate'].$gte = priceRange.min;
      if (priceRange.max) searchFilter['pricing.dailyRate'].$lte = priceRange.max;
    }

    // Only show available cars
    searchFilter['availability.isAvailable'] = true;

    // Execute search
    const cars = await Car.find(searchFilter).sort({ createdAt: -1 });

    // Save search history if user is logged in
    if (userId && userEmail) {
      const searchHistory = new SearchHistory({
        userId,
        userEmail,
        searchQuery: query || '',
        searchFilters: {
          location,
          pickupDate: pickupDate ? new Date(pickupDate) : null,
          returnDate: returnDate ? new Date(returnDate) : null,
          carType,
          priceRange
        },
        resultsCount: cars.length
      });
      
      await searchHistory.save();
    }

    res.json({
      success: true,
      cars,
      resultsCount: cars.length,
      searchQuery: query || '',
      filters: { location, pickupDate, returnDate, carType, priceRange }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      cars: [],
      resultsCount: 0
    });
  }
});

// Get search history for a user
app.get("/api/search-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const searchHistory = await SearchHistory.find({ userId })
      .sort({ searchTimestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      searchHistory
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get popular search terms
app.get("/api/search/popular", async (req, res) => {
  try {
    const popularSearches = await SearchHistory.aggregate([
      { $match: { searchQuery: { $ne: '' } } },
      { $group: { _id: '$searchQuery', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      popularSearches: popularSearches.map(item => ({
        query: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('Error fetching popular searches:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Image upload endpoint for car owners
app.post('/api/cars/:carId/images', upload.array('images', 10), async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.body.userId;

    // Find the car and verify ownership
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (car.ownerId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload images for this car' });
    }

    // Process uploaded files
    const newImages = req.files.map((file, index) => ({
      url: `/uploads/cars/${file.filename}`,
      alt: `${car.make} ${car.model} image ${car.images.length + index + 1}`,
      isPrimary: car.images.length === 0 && index === 0 // First image becomes primary if no images exist
    }));

    // Add new images to car
    car.images = car.images || [];
    car.images.push(...newImages);

    await car.save();

    res.json({
      success: true,
      message: `Successfully uploaded ${newImages.length} image(s)`,
      images: newImages,
      totalImages: car.images.length
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ success: false, message: 'Failed to upload images', error: error.message });
  }
});

// Delete car image endpoint
app.delete('/api/cars/:carId/images/:imageIndex', async (req, res) => {
  try {
    const { carId, imageIndex } = req.params;
    const userId = req.body.userId;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (car.ownerId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this car' });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= car.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    // Remove image from array
    const removedImage = car.images.splice(index, 1)[0];
    
    // If removed image was primary, make first remaining image primary
    if (removedImage.isPrimary && car.images.length > 0) {
      car.images[0].isPrimary = true;
    }

    await car.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      remainingImages: car.images.length
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Failed to delete image' });
  }
});

// Set primary image endpoint
app.put('/api/cars/:carId/images/:imageIndex/primary', async (req, res) => {
  try {
    const { carId, imageIndex } = req.params;
    const userId = req.body.userId;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: 'Car not found' });
    }

    if (car.ownerId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this car' });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= car.images.length) {
      return res.status(400).json({ success: false, message: 'Invalid image index' });
    }

    // Reset all images to non-primary
    car.images.forEach(img => img.isPrimary = false);
    
    // Set selected image as primary
    car.images[index].isPrimary = true;
    
    await car.save();

    res.json({
      success: true,
      message: 'Primary image updated successfully',
      primaryImage: car.images[index]
    });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ success: false, message: 'Failed to set primary image' });
  }
});

// AI Chat endpoint with OpenAI integration
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey || openaiApiKey === 'your_openai_api_key_here') {
      // Fallback to simulated responses if no API key
      let response = generateAIResponse(message, context);
      return res.json({ response });
    }
    
    // Initialize OpenAI
    const { OpenAI } = require('openai');
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });
    
    // Context-aware system prompts
    const systemPrompts = {
      general: "You are a helpful AI assistant for CarRent, a luxury car rental platform. Help users with general questions about car rentals, bookings, and the platform. Be friendly, professional, and provide accurate information about car rental services.",
      customer: "You are a CarRent AI assistant helping customers find and rent luxury cars. Provide helpful information about vehicles, pricing, booking process, and rental policies. Focus on helping them find the perfect car for their needs and making the rental process smooth.",
      owner: "You are a CarRent AI assistant helping car owners manage their rental business. Provide advice on listing cars, pricing strategies, managing bookings, and growing their rental income. Help them optimize their listings and maximize earnings.",
      cars: "You are a CarRent AI assistant specializing in helping users find the perfect rental car. Compare vehicles, explain features, and guide them through the selection process. Help them understand different car types, features, and what would work best for their needs.",
      booking: "You are a CarRent AI assistant focused on helping with the booking process. Explain rental terms, payment options, insurance, and booking procedures. Make the booking process clear and address any concerns about rentals.",
      manage: "You are a CarRent AI assistant helping owners manage their car listings and bookings. Provide guidance on optimization, customer service, and business growth. Help them succeed in the car rental business."
    };
    
    const systemPrompt = systemPrompts[context] || systemPrompts.general;
    
    // Prepare conversation messages
    const messages = [
      { role: "system", content: systemPrompt }
    ];
    
    // Add conversation history if provided
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.slice(-10).forEach(msg => {
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.message
        });
      });
    }
    
    // Add current user message
    messages.push({ role: "user", content: message });
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });
    
    const response = completion.choices[0].message.content;
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    
    // Fallback to simulated response on error
    let fallbackResponse = generateAIResponse(req.body.message, req.body.context);
    res.json({ 
      response: fallbackResponse,
      note: "Using fallback AI response due to API error"
    });
  }
});

// AI response generator (replace with actual AI service)
function generateAIResponse(message, context) {
  const lowerMessage = message.toLowerCase();
  
  // Common responses based on keywords
  if (lowerMessage.includes('rent') || lowerMessage.includes('booking')) {
    return "To rent a car on CarRent: 1) Browse our luxury vehicle collection, 2) Select your preferred dates, 3) Choose your car, 4) Complete the booking with your details, 5) Pick up your car at the designated location. Need help with any specific step?";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
    return "Our pricing varies by vehicle type and rental duration. We offer daily, weekly, and monthly rates with discounts for longer rentals. Luxury cars start from $100/day, premium vehicles from $200/day. Would you like me to help you find cars in a specific price range?";
  }
  
  if (lowerMessage.includes('owner') || lowerMessage.includes('list my car')) {
    return "Great! To list your car on CarRent: 1) Create an owner account, 2) Add your vehicle details and photos, 3) Set your pricing and availability, 4) Get verified, 5) Start earning! Our owners typically earn $500-2000+ monthly. Would you like guidance on any specific step?";
  }
  
  if (lowerMessage.includes('insurance') || lowerMessage.includes('coverage')) {
    return "All CarRent rentals include comprehensive insurance coverage including collision, theft, and liability protection. Additional coverage options are available. Your personal insurance may also provide coverage - we recommend checking with your provider.";
  }
  
  if (lowerMessage.includes('cancel') || lowerMessage.includes('refund')) {
    return "You can cancel your booking up to 24 hours before pickup for a full refund. Cancellations within 24 hours may incur fees depending on the car owner's policy. Premium cancellation protection is available during booking.";
  }
  
  if (lowerMessage.includes('luxury') || lowerMessage.includes('premium')) {
    return "Our luxury fleet includes BMW, Mercedes-Benz, Audi, Tesla, and exotic supercars. All vehicles are professionally maintained and detailed before each rental. Features typically include premium interiors, advanced tech, and superior performance. What type of luxury experience are you looking for?";
  }
  
  if (lowerMessage.includes('document') || lowerMessage.includes('requirement')) {
    return "You'll need: 1) Valid driver's license (held for 2+ years), 2) Credit card for security deposit, 3) Proof of insurance (or purchase our coverage), 4) Government-issued ID. International renters need an International Driving Permit. Age requirement is typically 25+ for luxury vehicles.";
  }
  
  if (context === 'owner' && (lowerMessage.includes('earning') || lowerMessage.includes('money'))) {
    return "CarRent owners earn 70-80% of rental fees. Factors affecting earnings: vehicle desirability, competitive pricing, high-quality photos, quick response times, and positive reviews. Top owners earn $1500-3000+ monthly. I can help you optimize your listing for maximum earnings!";
  }
  
  if (lowerMessage.includes('support') || lowerMessage.includes('help') || lowerMessage.includes('contact')) {
    return "I'm here to help! For immediate assistance, you can continue chatting with me. For complex issues, contact our 24/7 support team at support@carrent.com or call 1-800-CARRENT. Emergency roadside assistance is available for active rentals.";
  }
  
  // Default responses based on context
  const defaultResponses = {
    general: "I'm here to help with any questions about CarRent! I can assist with car rentals, bookings, pricing, becoming an owner, or general platform questions. What would you like to know?",
    customer: "I'd be happy to help you find the perfect rental car! I can help you browse vehicles, understand pricing, explain the booking process, or answer any rental questions. What are you looking for?",
    owner: "I'm here to help you succeed as a CarRent owner! I can assist with listing optimization, pricing strategies, managing bookings, or growing your rental business. What would you like to know?",
    cars: "I can help you find the perfect car for your needs! Tell me about your preferences - luxury level, size, features, budget, or rental duration - and I'll guide you to the best options.",
    booking: "I'm here to make your booking process smooth! I can explain rental terms, payment options, insurance coverage, pickup procedures, or answer any booking questions. How can I help?",
    manage: "I can help you manage your CarRent business effectively! Whether it's optimizing listings, handling bookings, pricing strategies, or customer service tips, I'm here to help. What do you need assistance with?"
  };
  
  return defaultResponses[context] || defaultResponses.general;
}

// Reports API endpoints
// Create a new report (owners and customers only)
app.post("/api/reports", async (req, res) => {
  try {
    const {
      reporterId,
      reportType,
      carId,
      bookingId,
      title,
      description,
      severity,
      incidentDate,
      location,
      attachments
    } = req.body;

    // Check user role - only owners and customers can create reports
    const user = await User.findById(reporterId);
    if (!user || user.userType === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only owners and customers can submit reports' 
      });
    }

    const reportData = {
      reporterId,
      reportType,
      title,
      description,
      severity: severity || 'medium',
      status: 'pending'
    };

    // Add optional fields if provided
    if (carId) reportData.carId = carId;
    if (bookingId) reportData.bookingId = bookingId;
    if (incidentDate) reportData.incidentDate = new Date(incidentDate);
    if (location) reportData.location = location;
    if (attachments) reportData.attachments = attachments;

    const report = new Report(reportData);
    await report.save();

    console.log('New report created:', report._id);
    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all reports (with role-based filtering)
app.get("/api/reports", async (req, res) => {
  try {
    const { userId, userRole } = req.query;
    let query = {};

    // Filter based on user role
    if (userRole === 'admin') {
      // Admins can see all reports
      query = {};
    } else {
      // Owners and customers can only see their own reports
      query = { reporterId: userId };
    }

    const reports = await Report.find(query)
      .populate('reporterId', 'name email userType')
      .populate('carId', 'make model year')
      .populate('bookingId', 'rentalPeriod')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single report by ID
app.get("/api/reports/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userId, userRole } = req.query;

    const report = await Report.findById(reportId)
      .populate('reporterId', 'name email userType')
      .populate('carId', 'make model year')
      .populate('bookingId', 'rentalPeriod')
      .populate('processedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Check permissions
    if (userRole !== 'admin' && report.reporterId._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only view your own reports' 
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update report status (admin only)
app.patch("/api/reports/:reportId/status", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminNotes, processedBy, userRole } = req.body;

    // Only admins can update report status
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can process reports' 
      });
    }

    const updateData = {
      status,
      processedAt: new Date()
    };

    if (adminNotes) updateData.adminNotes = adminNotes;
    if (processedBy) updateData.processedBy = processedBy;

    const report = await Report.findByIdAndUpdate(reportId, updateData, { new: true })
      .populate('reporterId', 'name email userType')
      .populate('carId', 'make model year')
      .populate('processedBy', 'name email');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    console.log('Report status updated:', reportId, 'to', status);
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete report (admin only)
app.delete("/api/reports/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { userRole } = req.body;

    // Only admins can delete reports
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins can delete reports' 
      });
    }

    const report = await Report.findByIdAndDelete(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    console.log('Report deleted:', reportId);
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle joining conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { conversationId, senderId, senderName, senderType, message, receiverId } = data;
      
      // Save message to database
      const newMessage = new Message({
        conversationId,
        senderId,
        senderName,
        senderType,
        message,
        timestamp: new Date()
      });
      
      await newMessage.save();
      
      // Update conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message,
        lastMessageTime: new Date(),
        $inc: { [`unreadCount.${senderType === 'customer' ? 'owner' : 'customer'}`]: 1 }
      });
      
      // Emit message to conversation room
      io.to(conversationId).emit('newMessage', {
        _id: newMessage._id,
        conversationId,
        senderId,
        senderName,
        senderType,
        message,
        timestamp: newMessage.timestamp
      });
      
      // Emit to receiver's personal room for notifications
      io.to(receiverId).emit('messageNotification', {
        conversationId,
        senderName,
        message,
        timestamp: newMessage.timestamp
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messageError', 'Failed to send message');
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
      userName: data.userName,
      isTyping: data.isTyping
    });
  });

  // Handle marking messages as read
  socket.on('markAsRead', async (data) => {
    try {
      const { conversationId, userId, userType } = data;
      
      // Mark messages as read
      await Message.updateMany(
        { 
          conversationId, 
          senderId: { $ne: userId },
          isRead: false 
        },
        { isRead: true }
      );
      
      // Reset unread count
      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${userType}`]: 0
      });
      
      socket.emit('messagesMarkedRead', { conversationId });
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Chat API endpoints
app.get('/api/chat/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const query = user.userType === 'customer' 
      ? { customerId: userId }
      : { ownerId: userId };
    
    const conversations = await Conversation.find(query)
      .populate('carId', 'make model year images')
      .populate('customerId', 'name email')
      .populate('ownerId', 'name email')
      .sort({ lastMessageTime: -1 });
    
    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

app.post('/api/chat/conversation', async (req, res) => {
  try {
    const { carId, customerId, ownerId } = req.body;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({ carId, customerId, ownerId });
    
    if (!conversation) {
      const car = await Car.findById(carId);
      if (!car) {
        return res.status(404).json({ success: false, message: 'Car not found' });
      }
      
      conversation = new Conversation({
        carId,
        customerId,
        ownerId,
        carTitle: `${car.year} ${car.make} ${car.model}`,
        lastMessage: 'Conversation started',
        lastMessageTime: new Date()
      });
      
      await conversation.save();
    }
    
    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, message: 'Failed to create conversation' });
  }
});

app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Simple Chat API Endpoints
// Get all users for starting new conversations
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, 'name email userType').limit(50);
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get conversations for current user
app.get("/api/conversations", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;

    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'name email userType')
    .sort({ 'lastMessage.createdAt': -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new conversation
app.post("/api/conversations", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;
    const { participantId } = req.body;

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] }
    }).populate('participants', 'name email userType');

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [userId, participantId]
      });
      await conversation.save();
      await conversation.populate('participants', 'name email userType');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get messages for a conversation
app.get("/api/conversations/:id/messages", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;
    const conversationId = req.params.id;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message
app.post("/api/conversations/:id/messages", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded.userId;
    const conversationId = req.params.id;
    const { content } = req.body;

    // Verify user is participant in conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Create message
    const message = new Message({
      conversationId,
      senderId: userId,
      content
    });
    await message.save();
    await message.populate('senderId', 'name email');

    // Update conversation last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content,
        senderId: userId,
        createdAt: new Date()
      }
    });

    res.json({ success: true, message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: MongoDB Atlas connected`);
  console.log(`🤖 AI Assistant: Ready`);
  console.log(`💬 Chat System: Socket.io Ready`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: https://your-app-name.onrender.com/api`);
});
