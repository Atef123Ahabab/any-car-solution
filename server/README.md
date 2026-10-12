# Car Rental System - Database Architecture

## Overview
The car rental system has been refactored to use a proper database-driven architecture instead of hardcoded data. All car information is now stored in MongoDB collections and managed through structured seeding processes.

## Architecture Changes

### 1. Data Storage
- **Before**: Car data was hardcoded directly in `server.js`
- **After**: Car data is stored in:
  - `data/cars-seed.json` - JSON file containing all car data
  - MongoDB `cars` collection - Database storage
  - `utils/seedDatabase.js` - Utility functions for database operations

### 2. Database Seeding
The system now uses a modular seeding approach:

```javascript
// Seed from JSON file
POST /api/cars/seed

// Get database summary
GET /api/cars/summary
```

### 3. File Structure
```
server/
├── data/
│   └── cars-seed.json          # Car data source
├── utils/
│   └── seedDatabase.js         # Database utilities
├── models/
│   └── Cars.js                 # Car schema
└── server.js                   # Main server file
```

## API Endpoints

### Car Management
- `GET /api/cars` - Get all cars
- `GET /api/cars/owner/:ownerId` - Get cars by owner
- `POST /api/cars` - Add new car
- `POST /api/cars/seed` - Seed database from JSON file
- `GET /api/cars/summary` - Get cars summary with count

### Database Utilities
The `seedDatabase.js` module provides:
- `seedCarsFromFile()` - Seeds database from JSON file
- `getCarCount()` - Returns total car count
- `getCarsSummary()` - Returns formatted car summary

## Benefits

1. **Maintainability**: Car data is separated from application logic
2. **Scalability**: Easy to add/modify car data without code changes
3. **Flexibility**: Can seed from different data sources
4. **Clean Architecture**: Clear separation of concerns
5. **Version Control**: Car data changes are tracked in JSON file

## Usage

### Adding New Cars
1. Edit `data/cars-seed.json` with new car data
2. Call `POST /api/cars/seed` to update database
3. Or add individual cars via `POST /api/cars`

### Database Management
```bash
# Seed database
curl -X POST http://localhost:3000/api/cars/seed

# Get summary
curl http://localhost:3000/api/cars/summary

# Get all cars
curl http://localhost:3000/api/cars
```

## Car Data Schema
Each car in the JSON file follows this structure:
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "type": "sedan",
  "ownerId": "test-owner-123",
  "images": [...],
  "pricing": {...},
  "availability": {...},
  "specifications": {...},
  "dimensions": {...},
  "features": {...},
  "location": {...},
  "description": "...",
  "condition": "excellent",
  "mileage": 15000,
  "licensePlate": "...",
  "status": "active"
}
```

This architecture provides a solid foundation for managing car rental data at scale.
