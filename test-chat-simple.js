const axios = require('axios');

async function testChat() {
  console.log('Testing chat functionality...\n');
  
  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const health = await axios.get('http://localhost:5002/api/health');
    console.log('✅ Health check:', health.data.status);
    
    // Test 2: Create session
    console.log('\n2. Creating chat session...');
    const session = await axios.post('http://localhost:5002/api/chat/session', {
      userId: '507f1f77bcf86cd799439011'
    });
    console.log('✅ Session created:', session.data.sessionId);
    
    // Test 3: Send general message (no documents)
    console.log('\n3. Testing general chat...');
    const generalChat = await axios.post('http://localhost:5002/api/chat/message', {
      sessionId: session.data.sessionId,
      message: 'Hello, can you help me?',
      documentIds: [],
      userId: '507f1f77bcf86cd799439011',
      messageType: 'chat'
    });
    console.log('✅ General chat response:', generalChat.data.message.content);
    
    console.log('\n🎉 Chat is working!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testChat();
