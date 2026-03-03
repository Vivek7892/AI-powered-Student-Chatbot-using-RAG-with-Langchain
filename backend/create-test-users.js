const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test users for different semesters
    const testUsers = [
      {
        email: 'student1@example.com',
        password: await bcrypt.hash('student123', 10),
        phoneNumber: '1234567890',
        semester: 'Semester 1'
      },
      {
        email: 'student3@example.com',
        password: await bcrypt.hash('student123', 10),
        phoneNumber: '1234567891',
        semester: 'Semester 3'
      },
      {
        email: 'student5@example.com',
        password: await bcrypt.hash('student123', 10),
        phoneNumber: '1234567892',
        semester: 'Semester 5'
      }
    ];

    for (const userData of testUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.email} (${userData.semester})`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }

    console.log('✅ Test users setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();