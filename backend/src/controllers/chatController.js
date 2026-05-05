const Chat = require('../models/Chat');
const UserDashboard = require('../models/UserDashboard');
const ragService = require('../langchain/ragService');
const openaiService = require('../services/openaiService');
const webSearchService = require('../services/webSearchService');
const { v4: uuidv4 } = require('uuid');

class ChatController {
  async createSession(req, res) {
    try {
      const userId = req.user._id;
      const sessionId = uuidv4();

      const chat = new Chat({
        userId,
        sessionId,
        messages: []
      });

      await chat.save();
      res.json({ sessionId, chatId: chat._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async sendMessage(req, res) {
    try {
      const {
        sessionId,
        message,
        documentIds = [],
        messageType = 'chat',
        chatMode = 'auto'
      } = req.body;
      const userId = req.user._id;

      const chat = await Chat.findOne({ sessionId });
      if (!chat) {
        return res.status(404).json({ error: 'Chat session not found' });
      }

      const userMessage = {
        messageId: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        context: { documentIds, messageType, chatMode }
      };
      chat.messages.push(userMessage);

      let aiResponse;
      let sources = [];

      switch (messageType) {
        case 'quiz':
        case 'quiz-generation':
          aiResponse = await this.handleQuizRequest(message, documentIds);
          break;

        case 'study-plan':
          aiResponse = await this.handleStudyPlanRequest(documentIds);
          break;

        default:
          ({ aiResponse, sources } = await this.handleChatRequest({
            message,
            documentIds,
            chatMode
          }));
          break;
      }

      chat.messages.push(aiResponse);
      chat.lastActivity = new Date();
      await chat.save();

      await this.updateDashboardStats({ userId, messageType, aiResponse });
      this.emitSocketUpdate(userId, aiResponse);

      res.json({
        message: aiResponse,
        sources,
        quiz: aiResponse.context?.quiz,
        studyPlan: aiResponse.context?.studyPlan
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async handleQuizRequest(message, documentIds) {
    try {
      if (documentIds.length === 0) {
        return {
          messageId: uuidv4(),
          role: 'assistant',
          content: "Please upload and select a document first to generate a quiz.",
          timestamp: new Date(),
          context: { documentIds, messageType: 'quiz-generation', sources: [] }
        };
      }

      const numQuestionsMatch = message?.match(/(\d+)\s+(?:questions?|quiz)/i);
      const numQuestions = numQuestionsMatch ? Math.min(parseInt(numQuestionsMatch[1], 10), 20) : 5;
      const quiz = await ragService.generateQuiz(documentIds[0], numQuestions);

      const Document = require('../models/Document');
      const document = await Document.findById(documentIds[0]);
      const docName = document ? document.fileName : 'your document';

      const quizData = {
        title: `Quiz: ${docName}`,
        totalQuestions: quiz.length,
        questions: quiz.map((q, index) => ({
          id: index + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correct || 0,
          explanation: q.explanation
        }))
      };

      return {
        messageId: uuidv4(),
        role: 'assistant',
        content: `I generated ${quiz.length} quiz questions from "${docName}".`,
        timestamp: new Date(),
        context: { documentIds, messageType: 'quiz-generation', quiz: quizData, sources: [] }
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        messageId: uuidv4(),
        role: 'assistant',
        content: 'I encountered an error generating the quiz. Please try again.',
        timestamp: new Date(),
        context: { documentIds, messageType: 'quiz-generation', sources: [] }
      };
    }
  }

  async handleStudyPlanRequest(documentIds) {
    try {
      if (documentIds.length === 0) {
        return {
          messageId: uuidv4(),
          role: 'assistant',
          content: 'Please select documents first to create a personalized study plan.',
          timestamp: new Date(),
          context: { documentIds, messageType: 'study-plan', sources: [] }
        };
      }

      const studyPlan = await ragService.generateStudyPlan(documentIds, {
        duration: 7,
        hoursPerDay: 2
      });

      return {
        messageId: uuidv4(),
        role: 'assistant',
        content: `I created a study plan based on your ${documentIds.length} selected document${documentIds.length !== 1 ? 's' : ''}.`,
        timestamp: new Date(),
        context: { documentIds, messageType: 'study-plan', studyPlan, sources: [] }
      };
    } catch (error) {
      console.error('Study plan generation error:', error);
      return {
        messageId: uuidv4(),
        role: 'assistant',
        content: 'I encountered an error creating the study plan. Please try again.',
        timestamp: new Date(),
        context: { documentIds, messageType: 'study-plan', sources: [] }
      };
    }
  }

  async handleChatRequest({ message, documentIds, chatMode }) {
    const normalizedMode = ['auto', 'docs', 'web', 'hybrid'].includes(chatMode) ? chatMode : 'auto';
    const hasDocuments = documentIds.length > 0;
    const webIntent = this.isWebIntent(message);

    const useDocs = hasDocuments && ['auto', 'docs', 'hybrid'].includes(normalizedMode);
    const useWeb = ['web', 'hybrid'].includes(normalizedMode)
      || (normalizedMode === 'auto' && (!hasDocuments || webIntent));

    try {
      const [docResult, webResult] = await Promise.all([
        useDocs ? this.queryDocuments(message, documentIds) : Promise.resolve(null),
        useWeb ? webSearchService.search(message, { maxResults: 5 }) : Promise.resolve(null)
      ]);

      const hasDocAnswer = Boolean(docResult && docResult.found);
      const webItems = Array.isArray(webResult?.results) ? webResult.results : [];
      const hasWebAnswer = webItems.length > 0;

      const webSources = webItems.map((item) => ({
        type: 'web',
        title: item.title,
        url: item.url,
        content: item.snippet
      }));

      let content = '';
      let usedMode = 'fallback';
      let mergedSources = [];

      if (hasDocAnswer && hasWebAnswer) {
        const webContext = webItems
          .map((item, index) => `[Web ${index + 1}] ${item.title}: ${item.snippet}`)
          .join('\n');
        content = await openaiService.synthesizeAnswer({
          question: message,
          documentContext: docResult.answer,
          webContext
        });
        usedMode = 'hybrid';
        mergedSources = [...docResult.sources, ...webSources];
      } else if (hasDocAnswer) {
        content = docResult.answer;
        usedMode = 'docs';
        mergedSources = docResult.sources;
      } else if (hasWebAnswer) {
        const webContext = webItems
          .map((item, index) => `[Web ${index + 1}] ${item.title}: ${item.snippet}`)
          .join('\n');
        content = await openaiService.synthesizeAnswer({
          question: message,
          webContext
        });
        usedMode = 'web';
        mergedSources = webSources;
      } else if (useDocs && hasDocuments) {
        content = `I could not find relevant information about "${message}" in the selected documents. Try rephrasing your question or selecting different files.`;
        usedMode = 'docs';
      } else {
        // No docs, no web results — answer directly with AI
        content = await openaiService.synthesizeAnswer({ question: message });
      }

      const aiResponse = {
        messageId: uuidv4(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        context: {
          documentIds,
          messageType: 'chat',
          chatModeRequested: normalizedMode,
          chatModeUsed: usedMode,
          sources: mergedSources
        }
      };

      return { aiResponse, sources: mergedSources };
    } catch (error) {
      console.error('Chat query failed:', error);
      return {
        aiResponse: {
          messageId: uuidv4(),
          role: 'assistant',
          content: 'I encountered an error while processing your question. Please try again.',
          timestamp: new Date(),
          context: {
            documentIds,
            messageType: 'chat',
            chatModeRequested: normalizedMode,
            chatModeUsed: 'error',
            sources: []
          }
        },
        sources: []
      };
    }
  }

  async queryDocuments(message, documentIds) {
    const answers = [];
    const collectedSources = [];

    for (const docId of documentIds) {
      try {
        const result = await ragService.queryDocument(message, docId);
        if (result?.answer && !/no relevant information found/i.test(result.answer)) {
          answers.push({
            documentId: docId,
            answer: result.answer
          });
          if (Array.isArray(result.sources)) {
            collectedSources.push(
              ...result.sources.map((src) => ({
                type: 'document',
                content: src.content || '',
                metadata: src.metadata || {}
              }))
            );
          }
        }
      } catch (error) {
        console.error(`Document query failed for ${docId}:`, error.message);
      }
    }

    if (answers.length === 0) {
      return { found: false, answer: '', sources: [] };
    }

    let mergedAnswer = answers.map((item, index) => `[Doc ${index + 1}] ${item.answer}`).join('\n\n');
    if (answers.length > 1) {
      try {
        const docContext = answers
          .map((item, index) => `[Doc ${index + 1}] ${item.answer}`)
          .join('\n\n');
        mergedAnswer = await openaiService.synthesizeAnswer({
          question: message,
          documentContext: docContext
        });
      } catch (error) {
        console.error('Multi-doc synthesis failed:', error.message);
      }
    } else if (answers.length === 1) {
      mergedAnswer = answers[0].answer;
    }

    return {
      found: true,
      answer: mergedAnswer,
      sources: collectedSources
    };
  }

  isWebIntent(message = '') {
    const pattern = /\b(latest|today|current|news|weather|price|stock|score|election|who is|what happened|internet|web)\b/i;
    return pattern.test(message);
  }

  async updateDashboardStats({ userId, messageType, aiResponse }) {
    try {
      const updateData = { $inc: {} };
      let activityTitle = 'AI Chat Session';
      let activityDescription = 'Had a conversation with AI assistant';

      if (messageType === 'quiz') {
        updateData.$inc['stats.quizzesCompleted'] = 1;
        activityTitle = 'Generated Quiz';
        activityDescription = `Created quiz with ${aiResponse.context?.quiz?.questions?.length || 0} questions`;
      } else if (messageType === 'study-plan') {
        updateData.$inc['stats.studyPlansCreated'] = 1;
        activityTitle = 'Created Study Plan';
        activityDescription = 'Generated personalized learning schedule';
      } else {
        updateData.$inc['stats.chatSessions'] = 1;
      }

      updateData.$push = {
        recentActivity: {
          $each: [{
            type: messageType,
            title: activityTitle,
            description: activityDescription,
            timestamp: new Date()
          }],
          $position: 0,
          $slice: 10
        }
      };

      await UserDashboard.findOneAndUpdate(
        { userId },
        updateData,
        { upsert: true, new: true }
      );
    } catch (error) {
      console.error('Failed to update dashboard stats:', error.message);
    }
  }

  emitSocketUpdate(userId, aiResponse) {
    try {
      const { io } = require('../app');
      io.to(`user-${userId}`).emit('new-message', aiResponse);
    } catch (error) {
      console.log('Socket emission failed:', error.message);
    }
  }

  async getChatHistory(req, res) {
    try {
      const userId = req.user._id;
      const { limit = 20 } = req.query;

      const chats = await Chat.find({ userId })
        .sort({ lastActivity: -1 })
        .limit(parseInt(limit, 10))
        .select('sessionId messages.content messages.role messages.timestamp lastActivity');

      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateQuiz(req, res) {
    try {
      const { documentId, numQuestions = 5 } = req.body;

      if (!documentId) {
        return res.status(400).json({ error: 'Document ID is required' });
      }

      const quiz = await ragService.generateQuiz(documentId, numQuestions);
      res.json({ quiz });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async generateStudyPlan(req, res) {
    try {
      const { documentIds = [], preferences = {} } = req.body;
      const studyPlan = await ragService.generateStudyPlan(documentIds, preferences);
      res.json({ studyPlan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getSession(req, res) {
    try {
      const { sessionId } = req.params;
      const chat = await Chat.findOne({ sessionId });

      if (!chat) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

const chatController = new ChatController();
const auth = require('../middleware/auth');

module.exports = {
  createSession: [auth, chatController.createSession.bind(chatController)],
  sendMessage: [auth, chatController.sendMessage.bind(chatController)],
  getChatHistory: [auth, chatController.getChatHistory.bind(chatController)],
  getSession: [auth, chatController.getSession.bind(chatController)],
  generateQuiz: [auth, chatController.generateQuiz.bind(chatController)],
  generateStudyPlan: [auth, chatController.generateStudyPlan.bind(chatController)]
};
