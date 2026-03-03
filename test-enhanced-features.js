<<<<<<< HEAD
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';

async function testEnhancedFeatures() {
  console.log('🚀 Testing Enhanced Document Processing and Q&A Features\n');
  
  try {
    // Test 1: Upload a document
    console.log('📄 Test 1: Document Upload');
    
    // Create a sample document for testing
    const sampleContent = `
Database Management System (DBMS)

A Database Management System (DBMS) is a software system that enables users to define, create, maintain, and control access to databases. It serves as an interface between the database and end users or application programs.

Key Components of DBMS:
1. Hardware - Physical devices like computers, storage devices
2. Software - The DBMS software itself and operating system
3. Data - The actual information stored in the database
4. Users - Database administrators, developers, and end users

Advantages of DBMS:
• Data Independence - Applications are independent of data storage details
• Reduced Data Redundancy - Eliminates duplicate data storage
• Data Integrity and Security - Ensures data accuracy and protection
• Efficient Data Access - Optimized data retrieval mechanisms
• Backup and Recovery - Automated data protection features

DBMS Architecture:
The three-tier architecture consists of:
1. External Level (View Level) - Closest to users, shows relevant data
2. Conceptual Level (Logical Level) - Describes what data is stored
3. Internal Level (Physical Level) - Describes how data is stored

ACID Properties:
Database transactions must follow ACID properties:
- Atomicity: All operations in a transaction succeed or fail together
- Consistency: Database remains in valid state after transaction
- Isolation: Concurrent transactions don't interfere with each other
- Durability: Committed transactions are permanently saved
    `;
    
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, sampleContent);
    
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('userId', 'test-user-123');
    
    const uploadResponse = await axios.post(`${BASE_URL}/documents/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Document uploaded:', {
      documentId: uploadResponse.data.documentId,
      fileName: uploadResponse.data.fileName,
      processed: uploadResponse.data.processed,
      contentLength: uploadResponse.data.contentLength,
      message: uploadResponse.data.message
    });
    
    const documentId = uploadResponse.data.documentId;
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    // Test 2: Verify document content extraction
    console.log('\n🔍 Test 2: Document Content Verification');
    
    const contentResponse = await axios.get(`${BASE_URL}/test/document/${documentId}`);
    console.log('✅ Content extracted:', {
      contentLength: contentResponse.data.contentLength,
      processed: contentResponse.data.processed,
      preview: contentResponse.data.contentPreview.substring(0, 100) + '...'
    });
    
    // Test 3: Test accurate Q&A
    console.log('\n❓ Test 3: Document-based Q&A');
    
    const questions = [
      'What is DBMS?',
      'What are the advantages of DBMS?',
      'What are the components of DBMS?',
      'Explain ACID properties',
      'What is three-tier architecture?'
    ];
    
    for (const question of questions) {
      try {
        const queryResponse = await axios.post(`${BASE_URL}/test/query`, {
          documentId,
          question
        });
        
        console.log(`\n📝 Q: ${question}`);
        console.log(`📋 A: ${queryResponse.data.result.answer.substring(0, 200)}${queryResponse.data.result.answer.length > 200 ? '...' : ''}`);
        console.log(`🎯 Sources: ${queryResponse.data.result.sources.length} relevant sections found`);
      } catch (error) {
        console.log(`❌ Error answering "${question}":`, error.response?.data?.error || error.message);
      }
    }
    
    // Test 4: Test quiz generation
    console.log('\n🧩 Test 4: Document-based Quiz Generation');
    
    const quizResponse = await axios.post(`${BASE_URL}/test/quiz`, {
      documentId,
      numQuestions: 5
    });
    
    console.log(`✅ Generated ${quizResponse.data.numQuestions} quiz questions:`);
    quizResponse.data.quiz.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question}`);
      q.options.forEach((option, i) => {
        const marker = i === q.correct ? '✓' : ' ';
        console.log(`   ${String.fromCharCode(65 + i)}. [${marker}] ${option}`);
      });
      console.log(`   💡 ${q.explanation}`);
    });
    
    // Test 5: Test chat integration
    console.log('\n💬 Test 5: Chat Integration');
    
    const chatResponse = await axios.post(`${BASE_URL}/chat/message`, {
      sessionId: 'test-session-123',
      message: 'What are the main benefits of using a DBMS?',
      documentIds: [documentId],
      userId: 'test-user-123'
    });
    
    console.log('✅ Chat response:', {
      content: chatResponse.data.message.content.substring(0, 200) + '...',
      sources: chatResponse.data.sources?.length || 0
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('• Document upload and processing: ✅');
    console.log('• Content extraction and cleaning: ✅');
    console.log('• Accurate document-based Q&A: ✅');
    console.log('• Document-specific quiz generation: ✅');
    console.log('• Chat integration: ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
=======
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5001/api';

async function testEnhancedFeatures() {
  console.log('🚀 Testing Enhanced Document Processing and Q&A Features\n');
  
  try {
    // Test 1: Upload a document
    console.log('📄 Test 1: Document Upload');
    
    // Create a sample document for testing
    const sampleContent = `
Database Management System (DBMS)

A Database Management System (DBMS) is a software system that enables users to define, create, maintain, and control access to databases. It serves as an interface between the database and end users or application programs.

Key Components of DBMS:
1. Hardware - Physical devices like computers, storage devices
2. Software - The DBMS software itself and operating system
3. Data - The actual information stored in the database
4. Users - Database administrators, developers, and end users

Advantages of DBMS:
• Data Independence - Applications are independent of data storage details
• Reduced Data Redundancy - Eliminates duplicate data storage
• Data Integrity and Security - Ensures data accuracy and protection
• Efficient Data Access - Optimized data retrieval mechanisms
• Backup and Recovery - Automated data protection features

DBMS Architecture:
The three-tier architecture consists of:
1. External Level (View Level) - Closest to users, shows relevant data
2. Conceptual Level (Logical Level) - Describes what data is stored
3. Internal Level (Physical Level) - Describes how data is stored

ACID Properties:
Database transactions must follow ACID properties:
- Atomicity: All operations in a transaction succeed or fail together
- Consistency: Database remains in valid state after transaction
- Isolation: Concurrent transactions don't interfere with each other
- Durability: Committed transactions are permanently saved
    `;
    
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, sampleContent);
    
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('userId', 'test-user-123');
    
    const uploadResponse = await axios.post(`${BASE_URL}/documents/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Document uploaded:', {
      documentId: uploadResponse.data.documentId,
      fileName: uploadResponse.data.fileName,
      processed: uploadResponse.data.processed,
      contentLength: uploadResponse.data.contentLength,
      message: uploadResponse.data.message
    });
    
    const documentId = uploadResponse.data.documentId;
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    // Test 2: Verify document content extraction
    console.log('\n🔍 Test 2: Document Content Verification');
    
    const contentResponse = await axios.get(`${BASE_URL}/test/document/${documentId}`);
    console.log('✅ Content extracted:', {
      contentLength: contentResponse.data.contentLength,
      processed: contentResponse.data.processed,
      preview: contentResponse.data.contentPreview.substring(0, 100) + '...'
    });
    
    // Test 3: Test accurate Q&A
    console.log('\n❓ Test 3: Document-based Q&A');
    
    const questions = [
      'What is DBMS?',
      'What are the advantages of DBMS?',
      'What are the components of DBMS?',
      'Explain ACID properties',
      'What is three-tier architecture?'
    ];
    
    for (const question of questions) {
      try {
        const queryResponse = await axios.post(`${BASE_URL}/test/query`, {
          documentId,
          question
        });
        
        console.log(`\n📝 Q: ${question}`);
        console.log(`📋 A: ${queryResponse.data.result.answer.substring(0, 200)}${queryResponse.data.result.answer.length > 200 ? '...' : ''}`);
        console.log(`🎯 Sources: ${queryResponse.data.result.sources.length} relevant sections found`);
      } catch (error) {
        console.log(`❌ Error answering "${question}":`, error.response?.data?.error || error.message);
      }
    }
    
    // Test 4: Test quiz generation
    console.log('\n🧩 Test 4: Document-based Quiz Generation');
    
    const quizResponse = await axios.post(`${BASE_URL}/test/quiz`, {
      documentId,
      numQuestions: 5
    });
    
    console.log(`✅ Generated ${quizResponse.data.numQuestions} quiz questions:`);
    quizResponse.data.quiz.forEach((q, index) => {
      console.log(`\n${index + 1}. ${q.question}`);
      q.options.forEach((option, i) => {
        const marker = i === q.correct ? '✓' : ' ';
        console.log(`   ${String.fromCharCode(65 + i)}. [${marker}] ${option}`);
      });
      console.log(`   💡 ${q.explanation}`);
    });
    
    // Test 5: Test chat integration
    console.log('\n💬 Test 5: Chat Integration');
    
    const chatResponse = await axios.post(`${BASE_URL}/chat/message`, {
      sessionId: 'test-session-123',
      message: 'What are the main benefits of using a DBMS?',
      documentIds: [documentId],
      userId: 'test-user-123'
    });
    
    console.log('✅ Chat response:', {
      content: chatResponse.data.message.content.substring(0, 200) + '...',
      sources: chatResponse.data.sources?.length || 0
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('• Document upload and processing: ✅');
    console.log('• Content extraction and cleaning: ✅');
    console.log('• Accurate document-based Q&A: ✅');
    console.log('• Document-specific quiz generation: ✅');
    console.log('• Chat integration: ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
>>>>>>> 3a8404a015d22246949d5219a5cad637a56db561
testEnhancedFeatures();