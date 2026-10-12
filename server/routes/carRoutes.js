import express from "express";
import Car from "../models/Cars.js";
import upload from "../middleware/upload.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Get all cars
router.get("/", async (req, res) => {
  try {
    const cars = await Car.find({}).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single car by ID
router.get("/:id", async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new car
router.post("/", async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error('Error adding car:', error);
    res.status(400).json({ error: error.message });
  }
});

// Upload images for a car
router.post("/:id/images", upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Check if user owns this car (assuming owner field exists)
    if (car.ownerId && car.ownerId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to upload images for this car" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Process uploaded files
    const newImages = req.files.map((file, index) => ({
      url: `/uploads/cars/${file.filename}`,
      alt: `${car.make} ${car.model} - Image ${car.images?.length + index + 1}`,
      isPrimary: car.images?.length === 0 && index === 0 // First image of empty car becomes primary
    }));

    // Add images to car
    if (!car.images) {
      car.images = [];
    }
    car.images.push(...newImages);

    await car.save();

    res.json({
      success: true,
      message: `Successfully uploaded ${newImages.length} image(s)`,
      images: newImages,
      car: car
    });

  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a car image
router.delete("/:id/images/:imageIndex", async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Check if user owns this car
    if (car.ownerId && car.ownerId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to delete images for this car" });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= car.images.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    const imageToDelete = car.images[index];
    
    // Delete physical file
    const filePath = path.join(process.cwd(), 'uploads/cars', path.basename(imageToDelete.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove from array
    car.images.splice(index, 1);

    // If deleted image was primary and there are other images, make first one primary
    if (imageToDelete.isPrimary && car.images.length > 0) {
      car.images[0].isPrimary = true;
    }

    await car.save();

    res.json({
      success: true,
      message: "Image deleted successfully",
      car: car
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Set primary image
router.put("/:id/images/:imageIndex/primary", async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "User ID required" });
    }

    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Check if user owns this car
    if (car.ownerId && car.ownerId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to modify images for this car" });
    }

    const index = parseInt(imageIndex);
    if (index < 0 || index >= car.images.length) {
      return res.status(400).json({ error: "Invalid image index" });
    }

    // Remove primary flag from all images
    car.images.forEach(img => img.isPrimary = false);
    
    // Set new primary image
    car.images[index].isPrimary = true;

    await car.save();

    res.json({
      success: true,
      message: "Primary image updated successfully",
      car: car
    });

  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
