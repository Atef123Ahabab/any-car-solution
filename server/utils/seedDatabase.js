import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Car from '../models/Cars.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seeds the database with car data from JSON file
 */
export const seedCarsFromFile = async () => {
  try {
    // Check if cars already exist
    const existingCars = await Car.countDocuments();
    if (existingCars > 0) {
      console.log('🚗 Cars already exist, skipping seed');
      return { success: true, count: existingCars, cars: [] };
    }

    // Read the cars seed file
    const seedFilePath = path.join(__dirname, '../data/cars-seed.json');
    
    if (!fs.existsSync(seedFilePath)) {
      console.log('⚠️ Cars seed file not found, creating sample data');
      return await createSampleCars();
    }

    const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
    
    // Insert cars into database
    const cars = await Car.insertMany(seedData);
    console.log(`✅ Successfully seeded ${cars.length} cars from file`);
    
    return { success: true, count: cars.length, cars };
  } catch (error) {
    console.error('❌ Error seeding cars:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets summary of cars in database
 */
export const getCarsSummary = async () => {
  try {
    const cars = await Car.find({}, 'make model year type pricing.dailyRate availability.isAvailable').limit(10);
    return cars;
  } catch (error) {
    console.error('Error getting cars summary:', error);
    return [];
  }
};

/**
 * Creates sample car data if seed file is not found
 */
const createSampleCars = async () => {
  try {
    const sampleCars = [
      {
        make: "Toyota",
        model: "Camry",
        year: 2023,
        type: "Sedan",
        licensePlate: "ABC123",
        ownerId: "sample_owner_1",
        pricing: {
          dailyRate: 50,
          currency: "USD"
        },
        availability: {
          isAvailable: true
        },
        location: {
          city: "New York",
          state: "NY"
        },
        images: []
      },
      {
        make: "Honda",
        model: "CR-V",
        year: 2022,
        type: "SUV",
        licensePlate: "XYZ789",
        ownerId: "sample_owner_2",
        pricing: {
          dailyRate: 65,
          currency: "USD"
        },
        availability: {
          isAvailable: true
        },
        location: {
          city: "Los Angeles",
          state: "CA"
        },
        images: []
      }
    ];

    const cars = await Car.insertMany(sampleCars);
    console.log(`✅ Created ${cars.length} sample cars`);
    return { success: true, count: cars.length, cars };
  } catch (error) {
    console.error('❌ Error creating sample cars:', error);
    return { success: false, error: error.message };
  }
};
