const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Admin = require('./src/models/Admin');
const Timetable = require('./src/models/Timetable');

async function debugTimetable() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    let admin = await Admin.findOne({ email: 'admin@example.com' });
    if (!admin) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = new Admin({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User'
      });
      await admin.save();
      console.log('Admin created');
    }

    // Test timetable creation
    console.log('Testing timetable creation...');
    const testTimetable = new Timetable({
      title: 'Test Timetable',
      description: 'Test Description',
      schedule: [
        ['Math', 'English', 'Science'],
        ['History', 'PE', 'Art']
      ],
      createdBy: admin._id
    });

    await testTimetable.save();
    console.log('Timetable created successfully:', testTimetable);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugTimetable();