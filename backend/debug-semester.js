const mongoose = require('mongoose');
require('dotenv').config();

const AdminNote = require('./src/models/AdminNote');
const User = require('./src/models/User');
const ImportantNote = require('./src/models/ImportantNote');
const MCQTest = require('./src/models/MCQTest');

async function debugSemester() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check users and their semesters
    const users = await User.find({}, 'email semester');
    console.log('👥 Users:');
    users.forEach(user => {
      console.log(`   ${user.email}: "${user.semester}"`);
    });
    console.log();

    // Check admin notes and their semesters
    const notes = await AdminNote.find({}, 'title semester');
    console.log('📚 Admin Notes:');
    notes.forEach(note => {
      console.log(`   ${note.title}: semester="${note.semester}"`);
    });
    console.log();

    // Check important notes
    const importantNotes = await ImportantNote.find({}, 'title semester');
    console.log('⚠️ Important Notes:');
    importantNotes.forEach(note => {
      console.log(`   ${note.title}: semester="${note.semester}"`);
    });
    console.log();

    // Check MCQ tests
    const mcqTests = await MCQTest.find({}, 'title semester');
    console.log('🧠 MCQ Tests:');
    mcqTests.forEach(test => {
      console.log(`   ${test.title}: semester="${test.semester}"`);
    });
    console.log();

    // Test semester matching logic
    const userSemester = 'Semester 3';
    const semesterNumber = userSemester?.replace(/[^0-9]/g, ''); // Extract number only
    console.log(`🔍 Semester Matching Test:`);
    console.log(`   User semester: "${userSemester}"`);
    console.log(`   Extracted number: "${semesterNumber}"`);
    
    const semesterQuery = {
      $or: [
        { semester: userSemester }, // Exact match
        { semester: semesterNumber }, // Number only
        { semester: `${semesterNumber}th` }, // With 'th'
        { semester: `${semesterNumber}nd` }, // With 'nd'
        { semester: `${semesterNumber}rd` }, // With 'rd'
        { semester: `${semesterNumber}st` } // With 'st'
      ]
    };
    
    console.log('   Query conditions:');
    semesterQuery.$or.forEach((condition, index) => {
      console.log(`     ${index + 1}. semester: "${condition.semester}"`);
    });
    console.log();

    // Test the actual query
    const matchingNotes = await AdminNote.find(semesterQuery);
    console.log(`📝 Matching notes found: ${matchingNotes.length}`);
    matchingNotes.forEach(note => {
      console.log(`   - ${note.title} (semester: "${note.semester}")`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugSemester();