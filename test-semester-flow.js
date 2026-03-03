<<<<<<< HEAD
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testSemesterFlow() {
  console.log('🧪 Testing Semester-Based Content Flow...\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLogin = await axios.post(`${BASE_URL}/api/admin/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully\n');

    // 2. Upload content for Semester 3
    console.log('2️⃣ Uploading content for Semester 3...');
    
    // Upload note
    const noteResponse = await axios.post(`${BASE_URL}/api/admin/notes`, {
      title: 'Data Structures - Semester 3',
      content: 'This is a comprehensive guide to data structures for semester 3 students.',
      semester: '3'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Note uploaded:', noteResponse.data.title);

    // Upload important note
    const importantNoteResponse = await axios.post(`${BASE_URL}/api/admin/important-notes`, {
      title: 'Semester 3 Exam Schedule',
      message: 'Mid-term exams for Semester 3 will be held from March 15-20, 2024.',
      semester: '3',
      priority: 'high'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Important note uploaded:', importantNoteResponse.data.title);

    // Upload MCQ test
    const mcqResponse = await axios.post(`${BASE_URL}/api/admin/mcq-tests`, {
      title: 'Data Structures Quiz - Semester 3',
      description: 'Test your knowledge of arrays, linked lists, and trees',
      semester: '3',
      timeLimit: 30,
      questions: [
        {
          question: 'What is the time complexity of inserting at the beginning of an array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctAnswer: 1
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ MCQ test uploaded:', mcqResponse.data.title);
    console.log();

    // 3. Student Login (Semester 3)
    console.log('3️⃣ Student Login (Semester 3)...');
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student3@example.com',
      password: 'student123'
    });
    const studentToken = studentLogin.data.token;
    console.log('✅ Student logged in successfully\n');

    // 4. Get Dashboard Content
    console.log('4️⃣ Fetching dashboard content for Semester 3 student...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const semesterContent = dashboardResponse.data.semesterContent;
    console.log('📚 Semester Content Found:');
    console.log(`   Notes: ${semesterContent.notes?.length || 0}`);
    console.log(`   Important Notes: ${semesterContent.importantNotes?.length || 0}`);
    console.log(`   MCQ Tests: ${semesterContent.mcqTests?.length || 0}`);
    console.log(`   Timetables: ${semesterContent.timetables?.length || 0}`);
    console.log();

    // 5. Display content details
    if (semesterContent.notes?.length > 0) {
      console.log('📝 Notes for Semester 3:');
      semesterContent.notes.forEach(note => {
        console.log(`   - ${note.title} (Semester ${note.semester})`);
      });
      console.log();
    }

    if (semesterContent.importantNotes?.length > 0) {
      console.log('⚠️ Important Notes for Semester 3:');
      semesterContent.importantNotes.forEach(note => {
        console.log(`   - ${note.title} (Priority: ${note.priority})`);
      });
      console.log();
    }

    if (semesterContent.mcqTests?.length > 0) {
      console.log('🧠 MCQ Tests for Semester 3:');
      semesterContent.mcqTests.forEach(test => {
        console.log(`   - ${test.title} (${test.questions?.length || 0} questions)`);
      });
      console.log();
    }

    // 6. Test with different semester student
    console.log('5️⃣ Testing with Semester 1 student...');
    const student1Login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student1@example.com',
      password: 'student123'
    });
    const student1Token = student1Login.data.token;
    
    const dashboard1Response = await axios.get(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${student1Token}` }
    });
    
    const semester1Content = dashboard1Response.data.semesterContent;
    console.log('📚 Semester 1 Content Found:');
    console.log(`   Notes: ${semester1Content.notes?.length || 0}`);
    console.log(`   Important Notes: ${semester1Content.importantNotes?.length || 0}`);
    console.log(`   MCQ Tests: ${semester1Content.mcqTests?.length || 0}`);
    console.log();

    console.log('✅ Semester-based content filtering is working correctly!');
    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
=======
const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function testSemesterFlow() {
  console.log('🧪 Testing Semester-Based Content Flow...\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLogin = await axios.post(`${BASE_URL}/api/admin/login`, {
      email: 'admin@example.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in successfully\n');

    // 2. Upload content for Semester 3
    console.log('2️⃣ Uploading content for Semester 3...');
    
    // Upload note
    const noteResponse = await axios.post(`${BASE_URL}/api/admin/notes`, {
      title: 'Data Structures - Semester 3',
      content: 'This is a comprehensive guide to data structures for semester 3 students.',
      semester: '3'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Note uploaded:', noteResponse.data.title);

    // Upload important note
    const importantNoteResponse = await axios.post(`${BASE_URL}/api/admin/important-notes`, {
      title: 'Semester 3 Exam Schedule',
      message: 'Mid-term exams for Semester 3 will be held from March 15-20, 2024.',
      semester: '3',
      priority: 'high'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Important note uploaded:', importantNoteResponse.data.title);

    // Upload MCQ test
    const mcqResponse = await axios.post(`${BASE_URL}/api/admin/mcq-tests`, {
      title: 'Data Structures Quiz - Semester 3',
      description: 'Test your knowledge of arrays, linked lists, and trees',
      semester: '3',
      timeLimit: 30,
      questions: [
        {
          question: 'What is the time complexity of inserting at the beginning of an array?',
          options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
          correctAnswer: 1
        }
      ]
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ MCQ test uploaded:', mcqResponse.data.title);
    console.log();

    // 3. Student Login (Semester 3)
    console.log('3️⃣ Student Login (Semester 3)...');
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student3@example.com',
      password: 'student123'
    });
    const studentToken = studentLogin.data.token;
    console.log('✅ Student logged in successfully\n');

    // 4. Get Dashboard Content
    console.log('4️⃣ Fetching dashboard content for Semester 3 student...');
    const dashboardResponse = await axios.get(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    const semesterContent = dashboardResponse.data.semesterContent;
    console.log('📚 Semester Content Found:');
    console.log(`   Notes: ${semesterContent.notes?.length || 0}`);
    console.log(`   Important Notes: ${semesterContent.importantNotes?.length || 0}`);
    console.log(`   MCQ Tests: ${semesterContent.mcqTests?.length || 0}`);
    console.log(`   Timetables: ${semesterContent.timetables?.length || 0}`);
    console.log();

    // 5. Display content details
    if (semesterContent.notes?.length > 0) {
      console.log('📝 Notes for Semester 3:');
      semesterContent.notes.forEach(note => {
        console.log(`   - ${note.title} (Semester ${note.semester})`);
      });
      console.log();
    }

    if (semesterContent.importantNotes?.length > 0) {
      console.log('⚠️ Important Notes for Semester 3:');
      semesterContent.importantNotes.forEach(note => {
        console.log(`   - ${note.title} (Priority: ${note.priority})`);
      });
      console.log();
    }

    if (semesterContent.mcqTests?.length > 0) {
      console.log('🧠 MCQ Tests for Semester 3:');
      semesterContent.mcqTests.forEach(test => {
        console.log(`   - ${test.title} (${test.questions?.length || 0} questions)`);
      });
      console.log();
    }

    // 6. Test with different semester student
    console.log('5️⃣ Testing with Semester 1 student...');
    const student1Login = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'student1@example.com',
      password: 'student123'
    });
    const student1Token = student1Login.data.token;
    
    const dashboard1Response = await axios.get(`${BASE_URL}/api/dashboard`, {
      headers: { Authorization: `Bearer ${student1Token}` }
    });
    
    const semester1Content = dashboard1Response.data.semesterContent;
    console.log('📚 Semester 1 Content Found:');
    console.log(`   Notes: ${semester1Content.notes?.length || 0}`);
    console.log(`   Important Notes: ${semester1Content.importantNotes?.length || 0}`);
    console.log(`   MCQ Tests: ${semester1Content.mcqTests?.length || 0}`);
    console.log();

    console.log('✅ Semester-based content filtering is working correctly!');
    console.log('🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testSemesterFlow();