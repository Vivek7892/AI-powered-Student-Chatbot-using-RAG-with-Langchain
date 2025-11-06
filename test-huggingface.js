require('dotenv').config({ path: './backend/.env' });
const geminiService = require('./backend/src/services/huggingfaceService');

async function testGemini() {
  console.log('Testing Gemini API integration...');
  
  const testQuestion = "What is machine learning?";
  const testContext = "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed.";
  
  try {
    const response = await geminiService.answerQuestion(testContext, testQuestion);
    
    if (response) {
      console.log('✅ Gemini API working!');
      console.log('Response:', response);
    } else {
      console.log('❌ No response from Gemini API');
      console.log('Check your API key in backend/.env file');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();