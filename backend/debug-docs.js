const mongoose = require('mongoose');
require('dotenv').config();

async function debugDocument() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Document = require('./src/models/Document');
    const documents = await Document.find({}).limit(5);
    
    console.log('Found documents:', documents.length);
    
    documents.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log('ID:', doc._id);
      console.log('Filename:', doc.fileName);
      console.log('Content length:', doc.content ? doc.content.length : 'No content');
      console.log('Processed:', doc.processed);
      if (doc.content) {
        console.log('Content preview:', doc.content.substring(0, 200) + '...');
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debugDocument();