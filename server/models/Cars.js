const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  make: String,
  model: String,
  year: Number,
  type: String,
  ownerId: String,
  images: [
    {
      url: String,
      alt: String,
      isPrimary: Boolean
    }
  ],
  pricing: {
    dailyRate: Number,
    weeklyRate: Number,
    monthlyRate: Number,
    currency: String
  },
  availability: {
    isAvailable: Boolean,
    availableFrom: Date,
    availableUntil: Date,
    unavailableDates: [Date]
  },
  specifications: {
    engine: Object,
    transmission: String,
    fuelType: String,
    fuelEconomy: {
      city: Number,
      highway: Number,
      combined: Number
    },
    drivetrain: String
  },
  dimensions: {
    seats: Number,
    doors: Number,
    luggage: Number
  },
  features: {
    safety: Object,
    comfort: Object,
    technology: Object
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String
  },
  description: String,
  condition: String,
  mileage: Number,
  licensePlate: String,
  status: String
});

module.exports = mongoose.model("Car", carSchema);