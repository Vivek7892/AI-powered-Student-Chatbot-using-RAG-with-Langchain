<<<<<<< HEAD
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const AdminNote = require('./backend/src/models/AdminNote');
const Timetable = require('./backend/src/models/Timetable');
const ImportantNote = require('./backend/src/models/ImportantNote');
const MCQTest = require('./backend/src/models/MCQTest');
const User = require('./backend/src/models/User');

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
    
    const semesterNotes = await AdminNote.find({ semester: testSemester });
    const semesterTimetables = await Timetable.find({ semester: testSemester });
    const semesterImportantNotes = await ImportantNote.find({ semester: testSemester });
    const semesterMcqTests = await MCQTest.find({ semester: testSemester });

    console.log(`Notes: ${semesterNotes.length}`);
    console.log(`Timetables: ${semesterTimetables.length}`);
    console.log(`Important Notes: ${semesterImportantNotes.length}`);
    console.log(`MCQ Tests: ${semesterMcqTests.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

=======
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const AdminNote = require('./backend/src/models/AdminNote');
const Timetable = require('./backend/src/models/Timetable');
const ImportantNote = require('./backend/src/models/ImportantNote');
const MCQTest = require('./backend/src/models/MCQTest');
const User = require('./backend/src/models/User');

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
    
    const semesterNotes = await AdminNote.find({ semester: testSemester });
    const semesterTimetables = await Timetable.find({ semester: testSemester });
    const semesterImportantNotes = await ImportantNote.find({ semester: testSemester });
    const semesterMcqTests = await MCQTest.find({ semester: testSemester });

    console.log(`Notes: ${semesterNotes.length}`);
    console.log(`Timetables: ${semesterTimetables.length}`);
    console.log(`Important Notes: ${semesterImportantNotes.length}`);
    console.log(`MCQ Tests: ${semesterMcqTests.length}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testSemesterContent();