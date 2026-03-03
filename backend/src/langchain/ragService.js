const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { PromptTemplate } = require('langchain/prompts');
const huggingfaceService = require('../services/huggingfaceService');
const openaiService = require('../services/openaiService');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const pptx2json = require('pptx2json');

class RAGService {
  constructor() {
    this.vectorStores = new Map();
    this.stopWords = new Set([
      'what', 'which', 'when', 'where', 'who', 'whom', 'whose', 'why', 'how',
      'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else',
      'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'as', 'about',
      'can', 'could', 'should', 'would', 'may', 'might', 'do', 'does', 'did'
    ]);
    console.log('RAG Service initialized with Hugging Face');
  }

  async extractTextFromFile(filePath, fileType) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      
      switch (fileType) {
        case 'pdf':
          const pdfData = await pdfParse(fileBuffer);
          return pdfData.text;
        case 'docx':
          const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
          return docxResult.value;
        case 'txt':
          return fileBuffer.toString('utf-8');
        case 'ppt':
        case 'pptx':
          const pptxData = await pptx2json.toJson(filePath);
          return pptxData.slides.map(slide => 
            slide.content.map(item => item.text || '').join(' ')
          ).join('\n\n');
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      throw error;
    }
  }

  async processDocument(filePath, fileType, documentId) {
    try {
      console.log(`Processing document: ${filePath} (${fileType})`);
      
      // Extract text from document
      const text = await this.extractTextFromFile(filePath, fileType);
      
      // Split text into chunks
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      const docs = await textSplitter.createDocuments([text], [
        { documentId, source: filePath }
      ]);
      
      // Store documents for retrieval
      const vectorStore = {
        docs: docs,
        search: (query) => {
          const queryLower = query.toLowerCase();
          const queryWords = queryLower.split(/\W+/).filter(w => w.length > 2);
          
          return docs.filter(doc => {
            const content = doc.pageContent.toLowerCase();
            return queryWords.some(word => content.includes(word));
          }).slice(0, 5);
        }
      };
      
      this.vectorStores.set(documentId, {
        vectorStore,
        processed: true,
        chunks: docs.length,
        text: text.substring(0, 500) // Store preview
      });

      return { success: true, chunksCreated: docs.length };
    } catch (error) {
      console.error('Document processing error:', error);
      // Fallback to mock processing
      this.vectorStores.set(documentId, {
        processed: true,
        chunks: 5,
        text: 'Mock document content for development'
      });
      return { success: true, chunksCreated: 5 };
    }
  }

  async queryDocument(question, documentId) {
    try {
      const Document = require('../models/Document');
      const document = await Document.findById(documentId);
      
      if (!document || !document.content) {
        return {
          answer: 'Document not found or content not extracted. Please re-upload the document.',
          sources: []
        };
      }

      console.log('Querying document:', document.fileName, 'Content length:', document.content.length);

      const chunks = await this.ensureDocumentChunks(documentId, document.content, document.fileName);
      const ranked = this.retrieveTopChunks(question, chunks, 6);

      if (ranked.length === 0 || ranked[0].score < 0.15) {
        return {
          answer: 'No relevant information found in the document.',
          sources: []
        };
      }

      const context = this.buildContextFromChunks(ranked);
      let answer;
      try {
        answer = await openaiService.synthesizeAnswer({
          question,
          documentContext: context
        });
      } catch (llmError) {
        console.error('LLM synthesis failed, returning extractive fallback:', llmError.message);
        answer = ranked.slice(0, 2).map((item) => item.chunk.pageContent).join('\n\n');
      }

      return {
        answer,
        sources: ranked.map((item, index) => ({
          content: item.chunk.pageContent,
          metadata: {
            documentId: document._id,
            fileName: document.fileName,
            chunkIndex: item.chunk.metadata?.chunkIndex ?? index,
            score: Number(item.score.toFixed(4))
          }
        }))
      };
    } catch (error) {
      console.error('Query error:', error);
      return {
        answer: `I'm having trouble accessing the document. Please ensure the document was uploaded and processed correctly.`,
        sources: []
      };
    }
  }

  async ensureDocumentChunks(documentId, content, fileName = '') {
    const cached = this.vectorStores.get(documentId);
    if (cached?.vectorStore?.docs?.length) {
      return cached.vectorStore.docs;
    }

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 900,
      chunkOverlap: 180
    });
    const docs = await splitter.createDocuments([content], [{ documentId, fileName, source: 'database' }]);
    const withMetadata = docs.map((doc, index) => ({
      ...doc,
      metadata: {
        ...(doc.metadata || {}),
        chunkIndex: index
      }
    }));

    this.vectorStores.set(documentId, {
      vectorStore: { docs: withMetadata },
      processed: true,
      chunks: withMetadata.length,
      content: content.substring(0, 500)
    });

    return withMetadata;
  }

  tokenize(text = '') {
    return text
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((token) => token && token.length > 2 && !this.stopWords.has(token));
  }

  scoreChunk(questionTokens, questionLower, chunkText) {
    const contentLower = chunkText.toLowerCase();
    const chunkTokens = new Set(this.tokenize(chunkText));
    let overlap = 0;
    for (const token of questionTokens) {
      if (chunkTokens.has(token)) overlap += 1;
    }

    const overlapRatio = questionTokens.length ? overlap / questionTokens.length : 0;
    const phraseBonus = contentLower.includes(questionLower) ? 0.45 : 0;
    const densityBonus = overlap >= 3 ? 0.2 : overlap >= 2 ? 0.1 : 0;
    return overlapRatio + phraseBonus + densityBonus;
  }

  retrieveTopChunks(question, chunks, limit = 5) {
    const questionLower = (question || '').toLowerCase().trim();
    const questionTokens = this.tokenize(questionLower);
    if (!questionTokens.length) return [];

    return chunks
      .map((chunk) => ({
        chunk,
        score: this.scoreChunk(questionTokens, questionLower, chunk.pageContent || '')
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  buildContextFromChunks(rankedChunks) {
    return rankedChunks
      .map((item, index) => `[Doc ${index + 1}] ${item.chunk.pageContent}`)
      .join('\n\n');
  }

  async findRelevantContent(question, content, document) {
    const questionLower = question.toLowerCase();
    const words = questionLower.split(/\W+/).filter(w => w.length > 2);
    const stopWords = ['what', 'is', 'are', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'why', 'when', 'where', 'who', 'which'];
    const keywords = words.filter(w => !stopWords.includes(w));
    
    if (keywords.length === 0) {
      return { answer: 'Please ask a more specific question.', sources: [] };
    }
    
    const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    
    // Score sentences by keyword matches
    const scored = sentences.map(sentence => {
      const lower = sentence.toLowerCase();
      let score = 0;
      
      keywords.forEach(keyword => {
        if (lower.includes(keyword)) {
          score += 1;
        }
      });
      
      return { sentence, score };
    }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
    
    if (scored.length === 0) {
      return { answer: 'No relevant information found.', sources: [] };
    }
    
    // Return the best matching sentence
    const bestMatch = scored[0].sentence;
    
    return {
      answer: bestMatch,
      sources: [{ content: bestMatch, metadata: { documentId: document._id } }]
    };
  }
  
  identifyQuestionType(question) {
    const q = question.toLowerCase();
    if (/^what is|^what are|define|definition|meaning/.test(q)) return 'definition';
    if (/^how|process|procedure|steps|method/.test(q)) return 'process';
    if (/^why|reason|cause|because/.test(q)) return 'explanation';
    if (/compare|contrast|difference|similar|versus/.test(q)) return 'comparison';
    if (/^when|time|date|period/.test(q)) return 'temporal';
    if (/^where|location|place/.test(q)) return 'location';
    if (/list|types|kinds|categories|examples/.test(q)) return 'enumeration';
    return 'general';
  }
  
  findFallbackContent(content, keywords) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Find sentences with any keyword
    const relevantSentences = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );
    
    if (relevantSentences.length > 0) {
      return relevantSentences.slice(0, 2).join('. ');
    }
    
    // Return first substantial paragraph as last resort
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    return paragraphs[0] || 'Content not available';
  }

  async processDocumentContent(content, documentId) {
    try {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      
      const docs = await textSplitter.createDocuments([content], [
        { documentId, source: 'database' }
      ]);
      
      const vectorStore = {
        docs: docs,
        search: (query) => {
          const queryLower = query.toLowerCase();
          const queryWords = queryLower.split(/\W+/).filter(w => w.length > 2);
          
          return docs.filter(doc => {
            const content = doc.pageContent.toLowerCase();
            return queryWords.some(word => content.includes(word));
          }).slice(0, 5);
        }
      };
      
      this.vectorStores.set(documentId, {
        vectorStore,
        processed: true,
        chunks: docs.length,
        content: content.substring(0, 500)
      });
      
      return { success: true, chunksCreated: docs.length };
    } catch (error) {
      console.error('Content processing error:', error);
      throw error;
    }
  }

  async getMockResponseFromDB(question, documentId) {
    try {
      const Document = require('../models/Document');
      const document = await Document.findById(documentId);
      
      if (document && document.content) {
        const content = document.content;
        const questionLower = question.toLowerCase();
        
        // Extract key terms from question
        const keyTerms = questionLower.split(/\W+/).filter(word => word.length > 3);
        
        // Find relevant paragraphs/sections
        const paragraphs = content.split(/\n\s*\n/);
        const relevantParagraphs = paragraphs.filter(para => 
          keyTerms.some(term => para.toLowerCase().includes(term))
        ).slice(0, 2);
        
        if (relevantParagraphs.length > 0) {
          // Create a comprehensive answer
          const answer = `Based on your document "${document.fileName}":\n\n${relevantParagraphs.join('\n\n')}`;
          
          return {
            answer: answer.length > 500 ? answer.substring(0, 500) + '...' : answer,
            sources: relevantParagraphs.map((para, index) => ({
              content: para.substring(0, 200) + '...',
              metadata: { documentId, fileName: document.fileName, section: index + 1 }
            }))
          };
        }
        
        // If no direct match, provide general content
        const firstParagraph = paragraphs.find(p => p.trim().length > 50) || content.substring(0, 300);
        return {
          answer: `From your document "${document.fileName}", here's relevant information: ${firstParagraph}`,
          sources: [{
            content: firstParagraph.substring(0, 200) + '...',
            metadata: { documentId, fileName: document.fileName }
          }]
        };
      }
      
      return {
        answer: `I found your document but it appears to be empty or not processed yet. Please try re-uploading the document.`,
        sources: []
      };
    } catch (error) {
      console.error('Database query error:', error);
      return {
        answer: `I encountered an error accessing your document. Please try again or re-upload the document.`,
        sources: []
      };
    }
  }

  getMockResponse(question, documentId) {
    const responses = [
      `Based on the document content, regarding "${question}": This appears to be related to key concepts in your study material. Let me break this down for you...`,
      `From what I can see in your document about "${question}": This is an important topic that connects to several other concepts you should understand.`,
      `Looking at your uploaded material for "${question}": Here's what you should focus on to better understand this topic...`
    ];
    
    return {
      answer: responses[Math.floor(Math.random() * responses.length)],
      sources: [{
        content: 'Content extracted from your uploaded document...',
        metadata: { documentId, chunkIndex: 0 }
      }]
    };
  }

  async generateQuiz(documentId, numQuestions = 5) {
    try {
      console.log(`Starting quiz generation for document ${documentId} with ${numQuestions} questions`);
      
      const Document = require('../models/Document');
      const document = await Document.findById(documentId);
      
      if (!document) {
        console.log('Document not found in database, using default quiz');
        return this.getDefaultQuiz().slice(0, numQuestions);
      }
      
      if (!document.content || document.content.trim().length < 100) {
        console.log('Document content is empty or too short, using default quiz');
        return this.getDefaultQuiz().slice(0, numQuestions);
      }
      
      console.log(`Generating quiz from document: ${document.fileName} (${document.content.length} characters)`);
      
      // Generate questions based on document content
      const questions = await this.generateQuestionsFromContent(document.content, numQuestions, document.fileName);
      
      console.log(`Successfully generated ${questions.length} questions`);
      return questions;
    } catch (error) {
      console.error('Quiz generation error:', error);
      console.log('Falling back to default quiz');
      return this.getDefaultQuiz().slice(0, numQuestions);
    }
  }
  
  async generateQuestionsFromContent(content, numQuestions, fileName) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    
    // Extract key concepts and definitions
    const concepts = this.extractKeyConcepts(content);
    const definitions = this.extractDefinitions(content);
    
    const questions = [];
    
    // Generate definition-based questions
    definitions.forEach((def, index) => {
      if (questions.length < numQuestions && def.term && def.definition) {
        questions.push({
          question: `What is ${def.term}?`,
          options: [
            def.definition,
            this.generateDistractor(def.definition, 1),
            this.generateDistractor(def.definition, 2),
            this.generateDistractor(def.definition, 3)
          ],
          correct: 0,
          explanation: `Based on the document: ${def.definition}`
        });
      }
    });
    
    // Generate concept-based questions
    concepts.forEach((concept, index) => {
      if (questions.length < numQuestions && concept.name && concept.description) {
        questions.push({
          question: `Which of the following best describes ${concept.name}?`,
          options: [
            concept.description,
            this.generateDistractor(concept.description, 1),
            this.generateDistractor(concept.description, 2),
            this.generateDistractor(concept.description, 3)
          ],
          correct: 0,
          explanation: `From the document: ${concept.description}`
        });
      }
    });
    
    // Generate factual questions from content
    const factualQuestions = this.generateFactualQuestions(content, numQuestions - questions.length);
    questions.push(...factualQuestions);
    
    // Generate questions from key sentences if we need more
    if (questions.length < numQuestions) {
      const keywordQuestions = this.generateKeywordQuestions(content, numQuestions - questions.length);
      questions.push(...keywordQuestions);
    }
    
    // Fill remaining with default questions if needed
    const defaultQuestions = this.getDefaultQuiz();
    while (questions.length < numQuestions) {
      const defaultIndex = questions.length % defaultQuestions.length;
      questions.push(defaultQuestions[defaultIndex]);
    }
    
    // Validate all questions have required fields
    const validQuestions = questions.filter(q => 
      q.question && 
      q.options && 
      q.options.length >= 2 && 
      typeof q.correct === 'number' && 
      q.correct >= 0 && 
      q.correct < q.options.length
    );
    
    // If we don't have enough valid questions, pad with defaults
    while (validQuestions.length < numQuestions) {
      const defaultIndex = validQuestions.length % defaultQuestions.length;
      validQuestions.push(defaultQuestions[defaultIndex]);
    }
    
    return validQuestions.slice(0, numQuestions);
  }
  
  extractKeyConcepts(content) {
    const concepts = [];
    const lines = content.split('\n').filter(line => line.trim().length > 10);
    
    lines.forEach(line => {
      // Look for patterns like "X is Y" or "X are Y"
      const isPattern = line.match(/([A-Z][\w\s]+)\s+(?:is|are)\s+([^.!?]+)/i);
      if (isPattern) {
        concepts.push({
          name: isPattern[1].trim(),
          description: isPattern[2].trim()
        });
      }
      
      // Look for bullet points or numbered lists
      const listPattern = line.match(/^\s*[•\-\*\d+\.)\s]+([^:]+):\s*(.+)/i);
      if (listPattern) {
        concepts.push({
          name: listPattern[1].trim(),
          description: listPattern[2].trim()
        });
      }
    });
    
    return concepts.slice(0, 3); // Limit to top 3 concepts
  }
  
  extractDefinitions(content) {
    const definitions = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    sentences.forEach(sentence => {
      // Look for definition patterns
      const defPattern = sentence.match(/([A-Z][\w\s]+)\s+(?:is|means|refers to|defined as)\s+([^.!?]+)/i);
      if (defPattern) {
        definitions.push({
          term: defPattern[1].trim(),
          definition: defPattern[2].trim()
        });
      }
    });
    
    return definitions.slice(0, 2); // Limit to top 2 definitions
  }
  
  generateFactualQuestions(content, count) {
    const questions = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30);
    
    // Look for sentences with numbers, lists, or specific facts
    const factualSentences = sentences.filter(sentence => {
      return /\d+|first|second|third|main|primary|key|important|types?|kinds?|categories/i.test(sentence);
    });
    
    factualSentences.slice(0, count).forEach((sentence, index) => {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 5) {
        // Create a fill-in-the-blank style question
        const keyWord = words.find(word => word.length > 4 && !/^(the|and|or|but|in|on|at|to|for|of|with|by)$/i.test(word));
        if (keyWord) {
          const questionText = sentence.replace(keyWord, '______');
          questions.push({
            question: `Complete the following statement: ${questionText}`,
            options: [
              keyWord,
              this.generateDistractor(keyWord, 1),
              this.generateDistractor(keyWord, 2),
              this.generateDistractor(keyWord, 3)
            ],
            correct: 0,
            explanation: `From the document: ${sentence.trim()}`
          });
        }
      }
    });
    
    return questions;
  }
  
  generateDistractor(correctAnswer, variant) {
    const commonWrongAnswers = [
      'A type of software application for data management',
      'A hardware component used for processing information',
      'A network protocol for secure communication',
      'A programming language feature for development',
      'A database management technique for storage',
      'A security mechanism for system protection',
      'An algorithm for efficient data processing',
      'A user interface design pattern for applications',
      'A mathematical model for statistical analysis',
      'A framework for web application development'
    ];
    
    // If the correct answer is short or we want variety, use common wrong answers
    if (correctAnswer.length < 60 || Math.random() > 0.7) {
      return commonWrongAnswers[variant % commonWrongAnswers.length];
    }
    
    // For longer answers, create plausible but incorrect variations
    const keyTerms = {
      'machine learning': ['artificial intelligence', 'data science', 'computer vision', 'natural language'],
      'neural networks': ['decision trees', 'linear regression', 'support vectors', 'random forests'],
      'deep learning': ['shallow learning', 'surface learning', 'basic learning', 'simple learning'],
      'artificial intelligence': ['machine learning', 'data mining', 'pattern recognition', 'expert systems'],
      'data': ['information', 'knowledge', 'statistics', 'algorithms'],
      'computers': ['machines', 'systems', 'devices', 'processors'],
      'patterns': ['structures', 'formats', 'designs', 'arrangements']
    };
    
    let modifiedAnswer = correctAnswer.toLowerCase();
    
    // Replace key terms with alternatives
    Object.keys(keyTerms).forEach(term => {
      if (modifiedAnswer.includes(term)) {
        const alternatives = keyTerms[term];
        const replacement = alternatives[variant % alternatives.length];
        modifiedAnswer = modifiedAnswer.replace(term, replacement);
      }
    });
    
    // If no modifications were made, use a common wrong answer
    if (modifiedAnswer === correctAnswer.toLowerCase()) {
      return commonWrongAnswers[variant % commonWrongAnswers.length];
    }
    
    return modifiedAnswer.charAt(0).toUpperCase() + modifiedAnswer.slice(1);
  }
  
  generateKeywordQuestions(content, count) {
    const questions = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 150);
    
    // Look for sentences with important keywords
    const importantSentences = sentences.filter(sentence => {
      return /\b(important|key|main|primary|essential|critical|significant|major|fundamental)\b/i.test(sentence);
    });
    
    importantSentences.slice(0, count).forEach((sentence, index) => {
      const cleanSentence = sentence.trim();
      const words = cleanSentence.split(/\s+/);
      
      if (words.length > 8) {
        // Find a good word to replace (not articles, prepositions, etc.)
        const keyWord = words.find(word => 
          word.length > 4 && 
          !/^(the|and|or|but|in|on|at|to|for|of|with|by|from|that|this|which|what|when|where|how|why)$/i.test(word)
        );
        
        if (keyWord) {
          const questionText = cleanSentence.replace(new RegExp(`\\b${keyWord}\\b`, 'i'), '______');
          questions.push({
            question: `Fill in the blank: ${questionText}`,
            options: [
              keyWord,
              this.generateDistractor(keyWord, 1),
              this.generateDistractor(keyWord, 2),
              this.generateDistractor(keyWord, 3)
            ],
            correct: 0,
            explanation: `From the document: ${cleanSentence}`
          });
        }
      }
    });
    
    return questions;
  }
  
  getDefaultQuiz() {
    return [
      {
        question: 'What is the primary purpose of studying?',
        options: [
          'To acquire knowledge and develop understanding',
          'To memorize information temporarily',
          'To pass time during the day',
          'To compete with other students'
        ],
        correct: 0,
        explanation: 'Studying helps us acquire knowledge, develop critical thinking skills, and build understanding of various subjects.'
      },
      {
        question: 'Which study technique is most effective for long-term retention?',
        options: [
          'Cramming before exams',
          'Passive reading only',
          'Active recall and spaced repetition',
          'Highlighting text extensively'
        ],
        correct: 2,
        explanation: 'Active recall and spaced repetition have been proven to be the most effective methods for long-term learning and retention.'
      },
      {
        question: 'What is the benefit of taking breaks during study sessions?',
        options: [
          'It wastes valuable study time',
          'It helps consolidate memory and prevents fatigue',
          'It is only useful for entertainment',
          'It reduces focus and concentration'
        ],
        correct: 1,
        explanation: 'Regular breaks help consolidate memory, prevent mental fatigue, and maintain focus during study sessions.'
      },
      {
        question: 'Which learning style involves learning through visual aids?',
        options: [
          'Auditory learning',
          'Kinesthetic learning',
          'Visual learning',
          'Reading/writing learning'
        ],
        correct: 2,
        explanation: 'Visual learners prefer to learn through charts, diagrams, images, and other visual representations of information.'
      },
      {
        question: 'What is the recommended approach when you don\'t understand a concept?',
        options: [
          'Skip it and move to the next topic',
          'Memorize it without understanding',
          'Ask questions and seek clarification',
          'Assume it\'s not important'
        ],
        correct: 2,
        explanation: 'When you don\'t understand something, it\'s best to ask questions, seek help, and work to clarify the concept rather than moving on.'
      },
      {
        question: 'What is the purpose of creating summaries while studying?',
        options: [
          'To make notes look more organized',
          'To reduce the amount of content',
          'To reinforce learning and identify key points',
          'To fill up study time'
        ],
        correct: 2,
        explanation: 'Creating summaries helps reinforce learning, identify key concepts, and provides a quick reference for review.'
      },
      {
        question: 'Which factor is most important for effective learning?',
        options: [
          'The amount of time spent studying',
          'The quality and focus of study sessions',
          'The number of books read',
          'The difficulty of the material'
        ],
        correct: 1,
        explanation: 'Quality and focused study sessions are more important than just the quantity of time spent studying.'
      },
      {
        question: 'What is the benefit of teaching others what you\'ve learned?',
        options: [
          'It shows off your knowledge',
          'It reinforces your own understanding',
          'It wastes your study time',
          'It confuses your own learning'
        ],
        correct: 1,
        explanation: 'Teaching others helps reinforce your own understanding and reveals gaps in your knowledge that need attention.'
      }
    ];
  }

  async generateStudyPlan(documentIds, preferences = {}) {
    const { duration = 7, hoursPerDay = 2 } = preferences;
    
    const Document = require('../models/Document');
    const allTopics = [];
    
    // Extract content from each document
    for (const docId of documentIds) {
      try {
        const doc = await Document.findById(docId);
        if (doc && doc.content) {
          const content = doc.content;
          
          // Extract chapters/sections
          const chapters = content.match(/chapter\s+\d+[^\n]*/gi) || [];
          const sections = content.match(/\d+\.\d*\s+[A-Z][^\n]*/g) || [];
          const headings = content.match(/^[A-Z][A-Z\s]{5,30}$/gm) || [];
          
          // Combine all found topics
          const docTopics = [...chapters, ...sections, ...headings]
            .map(topic => topic.trim())
            .filter(topic => topic.length > 5 && topic.length < 80)
            .slice(0, 10); // Limit per document
          
          // If no structured content, extract key sentences
          if (docTopics.length === 0) {
            const sentences = content.split(/[.!?]+/)
              .filter(s => s.trim().length > 30 && s.trim().length < 100)
              .slice(0, 5);
            docTopics.push(...sentences.map(s => s.trim()));
          }
          
          docTopics.forEach(topic => {
            allTopics.push({
              title: topic,
              source: doc.fileName,
              content: this.extractRelatedContent(content, topic)
            });
          });
        }
      } catch (error) {
        console.error('Error loading document:', error);
      }
    }

    // Create day-wise schedule
    const schedule = [];
    const topicsPerDay = Math.max(1, Math.ceil(allTopics.length / duration));
    
    for (let day = 1; day <= duration; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day - 1);
      
      const startIndex = (day - 1) * topicsPerDay;
      const dayTopics = allTopics.slice(startIndex, startIndex + topicsPerDay);
      
      const sessions = [];
      
      if (dayTopics.length > 0) {
        // Morning session
        sessions.push({
          time: '09:00-11:00',
          topic: `Study: ${dayTopics[0].title}`,
          activities: [
            `Read about ${dayTopics[0].title}`,
            'Take detailed notes',
            'Identify key concepts',
            'Create mind map'
          ],
          source: dayTopics[0].source
        });
        
        // Afternoon session if multiple topics
        if (dayTopics.length > 1) {
          sessions.push({
            time: '14:00-16:00',
            topic: `Review: ${dayTopics[1].title}`,
            activities: [
              `Study ${dayTopics[1].title}`,
              'Practice exercises',
              'Summarize key points',
              'Test understanding'
            ],
            source: dayTopics[1].source
          });
        }
        
        // Evening review
        sessions.push({
          time: '19:00-20:00',
          topic: 'Daily Review',
          activities: [
            'Review today\'s topics',
            'Create flashcards',
            'Practice recall',
            'Plan tomorrow\'s study'
          ]
        });
      }
      
      schedule.push({
        day,
        date: date.toISOString().split('T')[0],
        dayTitle: `Day ${day}: ${dayTopics.map(t => t.title.substring(0, 20)).join(', ')}`,
        sessions,
        topicsCount: dayTopics.length
      });
    }

    return {
      title: `${duration}-Day Study Plan`,
      totalDuration: `${duration} days`,
      documentsIncluded: documentIds.length,
      totalTopics: allTopics.length,
      schedule
    };
  }
  
  extractRelatedContent(content, topic) {
    const sentences = content.split(/[.!?]+/);
    const related = sentences.filter(s => 
      s.toLowerCase().includes(topic.toLowerCase().split(' ')[0])
    ).slice(0, 2);
    return related.join('. ');
  }

  async chatWithDocuments(question, documentIds = []) {
    if (documentIds.length === 0) {
      // General student assistant response
      const generalPrompt = `You are a helpful student assistant. Answer this question: ${question}`;
      
      try {
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'mock-key') {
          const result = await this.llm.call([{ role: 'user', content: generalPrompt }]);
          return result.content;
        }
      } catch (error) {
        console.error('General chat error:', error);
      }
      
      return `I'd be happy to help you with "${question}". As your student assistant, I can help you understand concepts, create study plans, generate quizzes, and answer questions about your uploaded documents. What specific area would you like to focus on?`;
    }

    // Query multiple documents
    const results = [];
    for (const docId of documentIds) {
      try {
        const result = await this.queryDocument(question, docId);
        results.push(result);
      } catch (error) {
        console.error(`Error querying document ${docId}:`, error);
      }
    }

    if (results.length === 0) {
      return "I couldn't find relevant information in your documents. Could you rephrase your question or upload more relevant materials?";
    }

    // Combine results from multiple documents
    const combinedAnswer = results.map((r, i) => `From Document ${i + 1}: ${r.answer}`).join('\n\n');
    const allSources = results.flatMap(r => r.sources);

    return {
      answer: combinedAnswer,
      sources: allSources
    };
  }
}

module.exports = new RAGService();
