import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Mic, MicOff, FileText, Brain, Calendar, Upload, MessageCircle, Sparkles, BookOpen } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

const Chat = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messageType, setMessageType] = useState(location.state?.messageType || 'chat');
  const [quiz, setQuiz] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadDocuments();
    createSession();
    if (location.state?.messageType) {
      setMessageType(location.state.messageType);
    }
  }, [location.state]);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents/507f1f77bcf86cd799439011');
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await api.post('/chat/session', {
        userId: '507f1f77bcf86cd799439011'
      });
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && messageType === 'chat') return;
    if (!sessionId) return;
    
    setLoading(true);
    const userMessage = {
      role: 'user',
      content: message || (messageType === 'quiz' ? 'Generate a quiz' : 'Create a study plan'),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    try {
      const response = await api.post('/chat/message', {
        sessionId,
        message: message || (messageType === 'quiz' ? 'Generate a quiz' : 'Create a study plan'),
        documentIds: selectedDocs,
        userId: '507f1f77bcf86cd799439011',
        messageType
      });
      
      // Add AI response
      setMessages(prev => [...prev, response.data.message]);
      
      // Handle different response types
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
      }
      if (response.data.studyPlan) {
        setStudyPlan(response.data.studyPlan);
      }
      
      setMessage('');
      setMessageType('chat');
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('document', file);
      
      try {
        const response = await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        const newDoc = {
          _id: response.data.documentId,
          fileName: file.name,
          processed: response.data.processed
        };
        
        setDocuments(prev => [...prev, newDoc]);
        setSelectedDocs(prev => [...prev, newDoc._id]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024
  });

  const renderQuiz = () => {
    if (!quiz || !Array.isArray(quiz)) return null;
    
    return (
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Generated Quiz</h3>
            <p className="text-sm text-slate-600">{quiz.length} questions</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {quiz.map((q, index) => (
            <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="font-semibold text-slate-800 mb-4">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-sm font-bold mr-3">
                  {index + 1}
                </span>
                {q.question}
              </p>
              
              <div className="space-y-2 mb-4">
                {q.options.map((option, i) => (
                  <div key={i} className={`p-3 rounded-xl border transition-all ${
                    i === q.correct 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                    <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                    {i === q.correct && (
                      <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">💡 Explanation:</span> {q.explanation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudyPlan = () => {
    if (!studyPlan) return null;
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{studyPlan.title}</h3>
            <p className="text-sm text-slate-600">Duration: {studyPlan.totalDuration}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {studyPlan.schedule.slice(0, 3).map((day, index) => (
            <div key={index} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold text-sm">
                  {day.day}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Day {day.day}</h4>
                  <p className="text-sm text-slate-600">{day.date}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {day.sessions.map((session, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-4">
                    <p className="font-medium text-slate-800 mb-2">
                      <span className="text-green-600">{session.time}:</span> {session.topic}
                    </p>
                    <ul className="space-y-1">
                      {session.activities.map((activity, j) => (
                        <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-fadeIn">
      <div className="flex h-screen max-w-full mx-auto">
        {/* Sidebar */}
        <div className="w-80 glass-effect border-r border-white/20 shadow-2xl animate-slideIn overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    sessionId ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></div>
                  <p className="text-sm text-slate-600 font-medium">
                    {sessionId ? 'Connected' : 'Connecting...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Documents</h3>
              </div>
              
              <div 
                {...getRootProps()} 
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer mb-6 transition-all duration-300 group ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50/50 scale-105' 
                    : 'border-slate-300 hover:border-green-400 hover:bg-green-50/30'
                } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                    isDragActive ? 'bg-green-500 scale-110' : 'bg-slate-100 group-hover:bg-green-100'
                  }`}>
                    <Upload className={`w-8 h-8 transition-colors duration-300 ${
                      isDragActive ? 'text-white' : 'text-slate-500 group-hover:text-green-600'
                    }`} />
                  </div>
                  {uploading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-sm font-semibold text-green-600">Uploading...</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800 mb-2">
                        {isDragActive ? 'Drop files here!' : 'Upload Documents'}
                      </p>
                      <p className="text-xs text-slate-500">PDF, DOCX, PPT, TXT • Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
              
              {documents.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-bold text-slate-700">
                      Available Documents
                    </p>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                      {documents.length}
                    </span>
                  </div>
                  {documents.map((doc, index) => (
                    <label key={doc._id} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 animate-slideIn interactive-hover ${
                      selectedDocs.includes(doc._id) 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 shadow-md scale-105' 
                        : 'bg-white/70 hover:bg-white/90 border-2 border-transparent hover:border-green-200'
                    }`} style={{animationDelay: `${index * 0.1}s`}}>
                      <input
                        type="checkbox"
                        checked={selectedDocs.includes(doc._id)}
                        onChange={() => toggleDocumentSelection(doc._id)}
                        className="w-5 h-5 text-green-600 rounded-lg focus:ring-green-500 focus:ring-2"
                      />
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedDocs.includes(doc._id) ? 'bg-green-500' : 'bg-slate-200'
                      }`}>
                        <FileText className={`w-4 h-4 ${
                          selectedDocs.includes(doc._id) ? 'text-white' : 'text-slate-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">Ready for AI analysis</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Quick Actions */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">AI Actions</h3>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setMessageType('chat');
                    setMessage('');
                  }}
                  className={`w-full p-5 text-left rounded-2xl font-semibold transition-all duration-300 group ${
                    messageType === 'chat' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                      : 'bg-white/60 hover:bg-white/80 border-2 border-white/20 text-slate-700 hover:border-blue-200 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      messageType === 'chat' ? 'bg-white/20' : 'bg-blue-100 group-hover:bg-blue-200'
                    }`}>
                      <MessageCircle className={`w-5 h-5 ${
                        messageType === 'chat' ? 'text-white' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-lg">Chat Mode</p>
                      <p className={`text-sm opacity-75 ${
                        messageType === 'chat' ? 'text-white' : 'text-slate-500'
                      }`}>Ask questions about your documents</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setMessageType('quiz');
                    setMessage('');
                  }}
                  className={`w-full p-5 text-left rounded-2xl font-semibold transition-all duration-300 group ${
                    messageType === 'quiz' 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg scale-105' 
                      : 'bg-white/60 hover:bg-white/80 border-2 border-white/20 text-slate-700 hover:border-purple-200 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      messageType === 'quiz' ? 'bg-white/20' : 'bg-purple-100 group-hover:bg-purple-200'
                    }`}>
                      <Brain className={`w-5 h-5 ${
                        messageType === 'quiz' ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-lg">Generate Quiz</p>
                      <p className={`text-sm opacity-75 ${
                        messageType === 'quiz' ? 'text-white' : 'text-slate-500'
                      }`}>Create practice questions</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    setMessageType('study-plan');
                    setMessage('');
                  }}
                  className={`w-full p-5 text-left rounded-2xl font-semibold transition-all duration-300 group ${
                    messageType === 'study-plan' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105' 
                      : 'bg-white/60 hover:bg-white/80 border-2 border-white/20 text-slate-700 hover:border-orange-200 hover:scale-105'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      messageType === 'study-plan' ? 'bg-white/20' : 'bg-orange-100 group-hover:bg-orange-200'
                    }`}>
                      <Calendar className={`w-5 h-5 ${
                        messageType === 'study-plan' ? 'text-white' : 'text-orange-600'
                      }`} />
                    </div>
                    <div>
                      <p className="text-lg">Study Plan</p>
                      <p className={`text-sm opacity-75 ${
                        messageType === 'study-plan' ? 'text-white' : 'text-slate-500'
                      }`}>Personalized learning schedule</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white/40 backdrop-blur-sm">
          {/* Chat Header */}
          <div className="px-8 py-6 border-b border-white/20 glass-effect">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  messageType === 'chat' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                  messageType === 'quiz' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}>
                  {messageType === 'chat' ? <MessageCircle className="w-6 h-6 text-white" /> :
                   messageType === 'quiz' ? <Brain className="w-6 h-6 text-white" /> :
                   <Calendar className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    {messageType === 'chat' ? 'AI Chat Assistant' :
                     messageType === 'quiz' ? 'Quiz Generator' :
                     'Study Plan Creator'}
                  </h2>
                  <div className="flex items-center space-x-3">
                    <p className="text-sm text-slate-600">
                      {selectedDocs.length > 0 
                        ? `${selectedDocs.length} document${selectedDocs.length !== 1 ? 's' : ''} selected`
                        : 'No documents selected'}
                    </p>
                    {selectedDocs.length > 0 && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                messageType === 'chat' ? 'bg-blue-100 text-blue-700' :
                messageType === 'quiz' ? 'bg-purple-100 text-purple-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {messageType === 'chat' ? '💬 Chat Mode' :
                 messageType === 'quiz' ? '🧠 Quiz Mode' : '📋 Plan Mode'}
              </div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-2xl ${
                  messageType === 'chat' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
                  messageType === 'quiz' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                  'bg-gradient-to-r from-green-500 to-emerald-600'
                }`}>
                  {messageType === 'chat' ? <Sparkles className="w-12 h-12 text-white" /> :
                   messageType === 'quiz' ? <Brain className="w-12 h-12 text-white" /> :
                   <Calendar className="w-12 h-12 text-white" />}
                </div>
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  {messageType === 'chat' ? '💬 Ready to Chat!' :
                   messageType === 'quiz' ? '🧠 Quiz Generator Ready' :
                   '📋 Study Plan Creator'}
                </h3>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed mb-8">
                  {messageType === 'chat' ? 'Start an intelligent conversation about your documents. Ask questions, get explanations, and explore your content with AI assistance.' :
                   messageType === 'quiz' ? 'Select your documents and generate personalized quizzes to test your knowledge and reinforce learning.' :
                   'Create a customized study schedule based on your uploaded materials and learning goals.'}
                </p>
                {selectedDocs.length === 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 max-w-md">
                    <p className="text-orange-800 font-medium">
                      📁 Select documents from the sidebar to get started
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {renderQuiz()}
            {renderStudyPlan()}
            
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble px-6 py-4 rounded-2xl shadow-sm interactive-hover ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md'
                    : 'bg-white/90 backdrop-blur-sm border border-slate-200/50 text-slate-800 rounded-bl-md'
                }`}>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className={`mt-3 pt-3 border-t text-xs opacity-75 ${
                      msg.role === 'user' ? 'border-white/20' : 'border-slate-200'
                    }`}>
                      <span className="inline-flex items-center gap-1">
                        📄 <span className="font-medium">Sources:</span> {msg.sources.length} document chunks
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="p-6 border-t border-white/20 glass-effect">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      messageType === 'chat' ? 'Ask me anything about your documents...' :
                      messageType === 'quiz' ? 'Click the generate button to create a quiz from your selected documents' :
                      'Click the generate button to create a personalized study plan'
                    }
                    className="w-full p-6 pr-16 border-2 border-white/30 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 transition-all bg-white/90 backdrop-blur-sm text-lg placeholder-slate-400 shadow-lg"
                    rows="3"
                    disabled={messageType !== 'chat'}
                  />
                  {messageType === 'chat' && message.trim() && (
                    <div className="absolute bottom-4 right-4 text-xs text-slate-400">
                      Press Enter to send
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setIsListening(!isListening)}
                className={`p-5 rounded-2xl transition-all duration-300 shadow-lg ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white scale-110 animate-pulse' 
                    : 'bg-white/80 hover:bg-white text-slate-600 hover:scale-105 border-2 border-white/30'
                }`}
              >
                {isListening ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              <button
                onClick={handleSend}
                disabled={(messageType === 'chat' && !message.trim()) || loading || selectedDocs.length === 0}
                className={`p-6 rounded-2xl text-white font-bold transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl ${
                  messageType === 'quiz' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
                  messageType === 'study-plan' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700' :
                    'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                } ${loading ? 'animate-pulse' : ''}`}
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {messageType === 'quiz' ? <Brain size={24} /> :
                     messageType === 'study-plan' ? <Calendar size={24} /> :
                     <Send size={24} />}
                    <span className="hidden sm:block text-lg">
                      {messageType === 'quiz' ? 'Generate' :
                       messageType === 'study-plan' ? 'Create' : 'Send'}
                    </span>
                  </div>
                )}
              </button>
            </div>
            
            {selectedDocs.length === 0 && (
              <div className="mt-4 text-center">
                <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 inline-block">
                  ⚠️ Please select documents from the sidebar to enable AI features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
