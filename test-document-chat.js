<<<<<<< HEAD
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDocumentChat() {
  try {
    console.log('Testing document upload and chat...');
    
    // Create test PDF content (simple text file for testing)
    const testContent = `
    Database Management Systems (DBMS)
    
    A Database Management System is software that manages databases. Key concepts include:
    
    1. Normalization: The process of organizing data to reduce redundancy
    2. ACID Properties: Atomicity, Consistency, Isolation, Durability
    3. SQL: Structured Query Language for database operations
    4. Indexing: Technique to speed up data retrieval
    5. Transactions: A unit of work performed against a database
    
    First Normal Form (1NF): Eliminates repeating groups
    Second Normal Form (2NF): Eliminates partial dependencies
    Third Normal Form (3NF): Eliminates transitive dependencies
    `;
    
    fs.writeFileSync('test-dbms.txt', testContent);
    
    // 1. Upload document
    const formData = new FormData();
    formData.append('document', fs.createReadStream('test-dbms.txt'));
    formData.append('userId', '507f1f77bcf86cd799439011');
    
    console.log('Uploading document...');
    const uploadResponse = await axios.post('http://localhost:5001/api/documents/upload', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Upload successful:', uploadResponse.data);
    const documentId = uploadResponse.data.documentId;
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Create chat session
    console.log('Creating chat session...');
    const sessionResponse = await axios.post('http://localhost:5001/api/chat/session', {
      userId: '507f1f77bcf86cd799439011'
    });
    
    const sessionId = sessionResponse.data.sessionId;
    console.log('Session created:', sessionId);
    
    // 3. Ask questions about the document
    const questions = [
      'What is normalization?',
      'What are ACID properties?',
      'Explain First Normal Form'
    ];
    
    for (const question of questions) {
      console.log(`\nAsking: "${question}"`);
      
      const chatResponse = await axios.post('http://localhost:5001/api/chat/message', {
        sessionId,
        message: question,
        documentIds: [documentId],
        userId: '507f1f77bcf86cd799439011'
      });
      
      console.log('Answer:', chatResponse.data.message.content);
      if (chatResponse.data.sources && chatResponse.data.sources.length > 0) {
        console.log('Sources found:', chatResponse.data.sources.length);
      }
    }
    
    // Clean up
    fs.unlinkSync('test-dbms.txt');
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

=======
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testDocumentChat() {
  try {
    console.log('Testing document upload and chat...');
    
    // Create test PDF content (simple text file for testing)
    const testContent = `
    Database Management Systems (DBMS)
    
    A Database Management System is software that manages databases. Key concepts include:
    
    1. Normalization: The process of organizing data to reduce redundancy
    2. ACID Properties: Atomicity, Consistency, Isolation, Durability
    3. SQL: Structured Query Language for database operations
    4. Indexing: Technique to speed up data retrieval
    5. Transactions: A unit of work performed against a database
    
    First Normal Form (1NF): Eliminates repeating groups
    Second Normal Form (2NF): Eliminates partial dependencies
    Third Normal Form (3NF): Eliminates transitive dependencies
    `;
    
    fs.writeFileSync('test-dbms.txt', testContent);
    
    // 1. Upload document
    const formData = new FormData();
    formData.append('document', fs.createReadStream('test-dbms.txt'));
    formData.append('userId', '507f1f77bcf86cd799439011');
    
    console.log('Uploading document...');
    const uploadResponse = await axios.post('http://localhost:5001/api/documents/upload', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Upload successful:', uploadResponse.data);
    const documentId = uploadResponse.data.documentId;
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Create chat session
    console.log('Creating chat session...');
    const sessionResponse = await axios.post('http://localhost:5001/api/chat/session', {
      userId: '507f1f77bcf86cd799439011'
    });
    
    const sessionId = sessionResponse.data.sessionId;
    console.log('Session created:', sessionId);
    
    // 3. Ask questions about the document
    const questions = [
      'What is normalization?',
      'What are ACID properties?',
      'Explain First Normal Form'
    ];
    
    for (const question of questions) {
      console.log(`\nAsking: "${question}"`);
      
      const chatResponse = await axios.post('http://localhost:5001/api/chat/message', {
        sessionId,
        message: question,
        documentIds: [documentId],
        userId: '507f1f77bcf86cd799439011'
      });
      
      console.log('Answer:', chatResponse.data.message.content);
      if (chatResponse.data.sources && chatResponse.data.sources.length > 0) {
        console.log('Sources found:', chatResponse.data.sources.length);
      }
    }
    
    // Clean up
    fs.unlinkSync('test-dbms.txt');
    console.log('\nTest completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testDocumentChat();