// Test Authentication Endpoints
// Run this with: node test-auth.js

const axios = require('axios');

const API_URL = 'http://localhost:5002/api';

async function testAuth() {
  console.log('🧪 Testing Authentication System\n');

  try {
    // Test 1: Signup
    console.log('1️⃣ Testing Signup...');
    const signupData = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123456',
      semester: 'Semester 1'
    };
    
    const signupResponse = await axios.post(`${API_URL}/auth/signup`, signupData);
    console.log('✅ Signup successful:', signupResponse.data.message);
    console.log('   User:', signupResponse.data.user.email);

    // Test 2: Login
    console.log('\n2️⃣ Testing Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: signupData.email,
      password: signupData.password
    });
    console.log('✅ Login successful');
    console.log('   Token received:', loginResponse.data.token.substring(0, 20) + '...');
    
    const token = loginResponse.data.token;

    // Test 3: Get Current User
    console.log('\n3️⃣ Testing Get Current User...');
    const userResponse = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User data retrieved:', userResponse.data.email);

    // Test 4: Forgot Password Link
    console.log('\n4️⃣ Testing Forgot Password...');
    const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password/send-link`, {
      email: signupData.email
    });
    console.log('✅ Forgot password link sent');
    if (forgotResponse.data.devResetLink) {
      console.log('   Dev Reset Link:', forgotResponse.data.devResetLink.substring(0, 80) + '...');
    }

    console.log('\n✅ All authentication tests passed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Error:', error.response.data.error || error.response.data);
    } else {
      console.error('   Error:', error.message);
    }
    console.log('\n💡 Make sure the backend server is running on port 5002\n');
  }
}

testAuth();
