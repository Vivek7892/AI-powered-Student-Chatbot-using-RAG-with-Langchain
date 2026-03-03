<<<<<<< HEAD
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testNotesUpload() {
  try {
    console.log('Testing Notes Upload API...');
    
    // Create a test text file
    const testContent = 'This is a test note for the upload functionality.\n\nIt contains some sample content to verify that the upload works correctly.';
    const testFilePath = path.join(__dirname, 'test-note.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    // Create form data
    const formData = new FormData();
    formData.append('note', fs.createReadStream(testFilePath));
    formData.append('userId', '507f1f77bcf86cd799439011');
    formData.append('name', 'Test Study Note');
    
    // Upload the note
    const uploadResponse = await axios.post('http://localhost:5002/api/notes/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Upload Response:', uploadResponse.data);
    
    // Test fetching notes
    const fetchResponse = await axios.get('http://localhost:5002/api/notes/507f1f77bcf86cd799439011');
    console.log('Fetch Notes Response:', fetchResponse.data);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    console.log('✅ Notes upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Notes upload test failed:', error.response?.data || error.message);
  }
}

=======
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testNotesUpload() {
  try {
    console.log('Testing Notes Upload API...');
    
    // Create a test text file
    const testContent = 'This is a test note for the upload functionality.\n\nIt contains some sample content to verify that the upload works correctly.';
    const testFilePath = path.join(__dirname, 'test-note.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    // Create form data
    const formData = new FormData();
    formData.append('note', fs.createReadStream(testFilePath));
    formData.append('userId', '507f1f77bcf86cd799439011');
    formData.append('name', 'Test Study Note');
    
    // Upload the note
    const uploadResponse = await axios.post('http://localhost:5002/api/notes/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('Upload Response:', uploadResponse.data);
    
    // Test fetching notes
    const fetchResponse = await axios.get('http://localhost:5002/api/notes/507f1f77bcf86cd799439011');
    console.log('Fetch Notes Response:', fetchResponse.data);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    console.log('✅ Notes upload test completed successfully!');
    
  } catch (error) {
    console.error('❌ Notes upload test failed:', error.response?.data || error.message);
  }
}

>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testNotesUpload();