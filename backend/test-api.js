const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAPI() {
  try {
    // First, login to get token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:5002/api/admin/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token received');

    // Test timetable creation
    console.log('Testing timetable creation...');
    const timetableResponse = await axios.post('http://localhost:5002/api/admin/timetable/create', {
      title: 'API Test Timetable',
      description: 'Created via API test',
      schedule: [
        ['Monday Morning', 'Monday Afternoon'],
        ['Tuesday Morning', 'Tuesday Afternoon']
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Timetable created successfully:', timetableResponse.data);
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testAPI();