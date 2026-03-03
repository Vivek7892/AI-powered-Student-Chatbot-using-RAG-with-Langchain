<<<<<<< HEAD
const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAuth() {
  try {
    console.log('Testing authentication system...\n');

    // Test signup
    console.log('1. Testing signup...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      captchaToken: 'test-captcha-token'
    });
    console.log('Signup response:', signupResponse.data);

    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);

    console.log('\n✅ Authentication system working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Start server first, then test
const { spawn } = require('child_process');

console.log('Starting backend server...');
const server = spawn('npm', ['start'], { 
  cwd: './backend',
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Server running on port')) {
    console.log('Server started, running tests...\n');
    setTimeout(testAuth, 1000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
=======
const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAuth() {
  try {
    console.log('Testing authentication system...\n');

    // Test signup
    console.log('1. Testing signup...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      email: 'test@example.com',
      password: 'password123',
      phoneNumber: '+1234567890',
      captchaToken: 'test-captcha-token'
    });
    console.log('Signup response:', signupResponse.data);

    // Test login
    console.log('\n2. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login response:', loginResponse.data);

    console.log('\n✅ Authentication system working correctly!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Start server first, then test
const { spawn } = require('child_process');

console.log('Starting backend server...');
const server = spawn('npm', ['start'], { 
  cwd: './backend',
  stdio: 'pipe'
});

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('Server running on port')) {
    console.log('Server started, running tests...\n');
    setTimeout(testAuth, 1000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
});