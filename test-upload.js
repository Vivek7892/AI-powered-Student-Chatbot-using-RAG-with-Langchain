<<<<<<< HEAD
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Create a simple test file
    const testContent = 'This is a test document for upload testing.';
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, testContent);

    // Create form data
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('userId', 'test-user-123');

    // Test the upload endpoint
    const response = await axios.post('http://localhost:5001/api/documents/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Upload successful:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

=======
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Create a simple test file
    const testContent = 'This is a test document for upload testing.';
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, testContent);

    // Create form data
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('userId', 'test-user-123');

    // Test the upload endpoint
    const response = await axios.post('http://localhost:5001/api/documents/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    console.log('Upload successful:', response.data);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('Upload failed:', error.response?.data || error.message);
  }
}

>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testUpload();