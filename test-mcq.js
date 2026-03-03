<<<<<<< HEAD
const fetch = require('node-fetch');

async function testMCQ() {
  try {
    // Test admin login
    console.log('Testing admin login...');
    const loginResponse = await fetch('http://localhost:5002/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.log('Login failed, creating admin...');
      // Try to create admin first
      const createResponse = await fetch('http://localhost:5002/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Test Admin',
          email: 'admin@test.com', 
          password: 'admin123' 
        })
      });
      console.log('Create admin response:', await createResponse.text());
      return;
    }
    
    const token = loginData.token;
    console.log('Login successful, token:', token);
    
    // Test MCQ creation
    console.log('Testing MCQ creation...');
    const formData = new FormData();
    formData.append('title', 'Test MCQ');
    formData.append('description', 'Test Description');
    formData.append('semester', '1');
    formData.append('timeLimit', '30');
    formData.append('questions', JSON.stringify([
      {
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      }
    ]));
    
    const mcqResponse = await fetch('http://localhost:5002/api/admin/mcq-tests', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const mcqData = await mcqResponse.json();
    console.log('MCQ creation response:', mcqResponse.status, mcqData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

=======
const fetch = require('node-fetch');

async function testMCQ() {
  try {
    // Test admin login
    console.log('Testing admin login...');
    const loginResponse = await fetch('http://localhost:5002/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginResponse.ok) {
      console.log('Login failed, creating admin...');
      // Try to create admin first
      const createResponse = await fetch('http://localhost:5002/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: 'Test Admin',
          email: 'admin@test.com', 
          password: 'admin123' 
        })
      });
      console.log('Create admin response:', await createResponse.text());
      return;
    }
    
    const token = loginData.token;
    console.log('Login successful, token:', token);
    
    // Test MCQ creation
    console.log('Testing MCQ creation...');
    const formData = new FormData();
    formData.append('title', 'Test MCQ');
    formData.append('description', 'Test Description');
    formData.append('semester', '1');
    formData.append('timeLimit', '30');
    formData.append('questions', JSON.stringify([
      {
        question: 'What is 2+2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      }
    ]));
    
    const mcqResponse = await fetch('http://localhost:5002/api/admin/mcq-tests', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const mcqData = await mcqResponse.json();
    console.log('MCQ creation response:', mcqResponse.status, mcqData);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testMCQ();