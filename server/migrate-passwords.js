import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// User schema (simplified for migration)
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  userType: String,
  isActive: Boolean
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const migratePasswords = async () => {
  try {
    console.log('🔄 Starting password migration...');
    
    // Find all users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users in database`);
    
    let migratedCount = 0;
    
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`🔧 Migrating password for user: ${user.email}`);
        
        // Hash the plain text password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update user with hashed password
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        migratedCount++;
        
        console.log(`✅ Password migrated for: ${user.email}`);
      } else {
        console.log(`⏭️  Password already hashed for: ${user.email}`);
      }
    }
    
    console.log(`🎉 Migration complete! ${migratedCount} passwords migrated.`);
    
    // Verify migration by listing all users
    const updatedUsers = await User.find({}, 'email userType password');
    console.log('\n📋 All users after migration:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.email} (${user.userType}) - Password hashed: ${user.password.startsWith('$2b$')}`);
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration
connectDB().then(() => {
  migratePasswords();
});
