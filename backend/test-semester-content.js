const mongoose = require('mongoose');
require('dotenv').config();

const AdminNote = require('./src/models/AdminNote');
const Timetable = require('./src/models/Timetable');
const ImportantNote = require('./src/models/ImportantNote');
const MCQTest = require('./src/models/MCQTest');
const User = require('./src/models/User');

async function testSemesterContent() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all users and their semesters
    const users = await User.find({}, 'email semester');
    console.log('\n=== USERS ===');
    users.forEach(user => {
      console.log(`${user.email}: Semester ${user.semester}`);
    });

    // Check all admin content
    const notes = await AdminNote.find({}, 'title semester');
    const timetables = await Timetable.find({}, 'title semester');
    const importantNotes = await ImportantNote.find({}, 'title semester');
    const mcqTests = await MCQTest.find({}, 'title semester');

    console.log('\n=== ADMIN NOTES ===');
    notes.forEach(note => {
      console.log(`${note.title}: Semester ${note.semester}`);
    });

    console.log('\n=== TIMETABLES ===');
    timetables.forEach(timetable => {
      console.log(`${timetable.title}: Semester ${timetable.semester}`);
    });

    console.log('\n=== IMPORTANT NOTES ===');
    importantNotes.forEach(note => {
      console.log(`${note.title}: Semester ${note.semester}`);
    });

    console.log('\n=== MCQ TESTS ===');
    mcqTests.forEach(test => {
      console.log(`${test.title}: Semester ${test.semester}`);
    });

    // Test semester matching for a specific semester
    const testSemester = '5th';
    console.log(`\n=== CONTENT FOR SEMESTER ${testSemester} ===`);
    
    // Test flexible matching
    const semesterNumber = testSemester?.replace(/[^0-9]/g, ''); // Extract number only
    const semesterQuery = {
      $or: [
        { semester: testSemester }, // Exact match
        { semester: semesterNumber }, // Number only
        { semester: `${semesterNumber}th` }, // With 'th'
        { semester: `${semesterNumber}nd` }, // With 'nd'
        { semester: `${semesterNumber}rd` }, // With 'rd'
        { semester: `${semesterNumber}st` } // With 'st'
      ]
    };
    
    const semesterNotes = await AdminNote.find(semesterQuery);
    const semesterTimetables = await Timetable.find(semesterQuery);
    const semesterImportantNotes = await ImportantNote.find(semesterQuery);
    const semesterMcqTests = await MCQTest.find(semesterQuery);

    console.log(`Notes: ${semesterNotes.length}`);
    console.log(`Timetables: ${semesterTimetables.length}`);
    console.log(`Important Notes: ${semesterImportantNotes.length}`);
    console.log(`MCQ Tests: ${semesterMcqTests.length}`);
    
    if (semesterNotes.length > 0) {
      console.log('Found notes:');
      semesterNotes.forEach(note => console.log(`  - ${note.title} (semester: ${note.semester})`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testSemesterContent();