const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  searchQuery: {
    type: String,
    required: true
  },
  searchFilters: {
    location: String,
    pickupDate: Date,
    returnDate: Date,
    carType: String,
    priceRange: {
      min: Number,
      max: Number
    }
  },
  resultsCount: {
    type: Number,
    default: 0
  },
  searchTimestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
searchHistorySchema.index({ userId: 1, searchTimestamp: -1 });
searchHistorySchema.index({ userEmail: 1, searchTimestamp: -1 });

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
