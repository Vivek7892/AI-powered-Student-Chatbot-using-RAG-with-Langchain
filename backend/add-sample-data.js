const mongoose = require('mongoose');
require('dotenv').config();

const AdminNote = require('./src/models/AdminNote');
const Timetable = require('./src/models/Timetable');
const ImportantNote = require('./src/models/ImportantNote');
const MCQTest = require('./src/models/MCQTest');
const Admin = require('./src/models/Admin');

async function addSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create admin
    let admin = await Admin.findOne({ email: 'admin@example.com' });
    if (!admin) {
      admin = new Admin({
        name: 'Sample Admin',
        email: 'admin@example.com',
        password: 'hashedpassword'
      });
      await admin.save();
    }

    // Add sample notes for 5th semester
    const notes = [
      {
        title: 'Software Engineering Fundamentals',
        content: 'Introduction to software development lifecycle, requirements analysis, and system design principles.',
        semester: '5th',
        uploadedBy: admin._id
      },
      {
        title: 'Database Management Systems',
        content: 'Advanced database concepts including normalization, indexing, and query optimization.',
        semester: '5th',
        uploadedBy: admin._id
      },
      {
        title: 'Web Development Technologies',
        content: 'Modern web development using React, Node.js, and database integration.',
        semester: '5th',
        uploadedBy: admin._id
      }
    ];

    // Add sample timetable
    const timetables = [
      {
        title: '5th Semester Class Schedule',
        description: 'Weekly class timetable for 5th semester students',
        semester: '5th',
        createdBy: admin._id
      }
    ];

    // Add important notes
    const importantNotes = [
      {
        title: 'Mid-term Exam Schedule',
        message: 'Mid-term examinations will be conducted from March 15-25. Please check your individual schedules.',
        semester: '5th',
        priority: 'high',
        createdBy: admin._id
      },
      {
        title: 'Project Submission Deadline',
        message: 'Final project submissions are due by April 30th. Late submissions will not be accepted.',
        semester: '5th',
        priority: 'medium',
        createdBy: admin._id
      }
    ];

    // Add MCQ tests
    const mcqTests = [
      {
        title: 'Software Engineering Quiz',
        description: 'Test your knowledge of software engineering concepts',
        semester: '5th',
        timeLimit: 30,
        questions: [
          {
            question: 'What is the first phase of SDLC?',
            options: ['Design', 'Requirements Analysis', 'Testing', 'Implementation'],
            correctAnswer: 1
          },
          {
            question: 'Which design pattern is used for creating objects?',
            options: ['Observer', 'Factory', 'Strategy', 'Decorator'],
            correctAnswer: 1
          }
        ],
        createdBy: admin._id
      }
    ];

    // Insert data
    await AdminNote.insertMany(notes);
    await Timetable.insertMany(timetables);
    await ImportantNote.insertMany(importantNotes);
    await MCQTest.insertMany(mcqTests);

    console.log('Sample data added successfully!');
    console.log(`Added ${notes.length} notes`);
    console.log(`Added ${timetables.length} timetables`);
    console.log(`Added ${importantNotes.length} important notes`);
    console.log(`Added ${mcqTests.length} MCQ tests`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSampleData();