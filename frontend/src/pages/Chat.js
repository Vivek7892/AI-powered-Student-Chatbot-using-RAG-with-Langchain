import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Send, Mic, MicOff, FileText, Brain, Calendar, Upload, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import './WorkspaceModern.css';

const Chat = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [messageType, setMessageType] = useState(location.state?.messageType || 'chat');
  const [chatMode, setChatMode] = useState('auto');
  const [quiz, setQuiz] = useState(null);
  const [studyPlan, setStudyPlan] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, quiz, studyPlan]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
        setSpeechSupported(true);
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setMessage((prev) => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    createSession();
    if (location.state?.messageType) {
      setMessageType(location.state.messageType);
    }
    // Welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hi! I\'m your AI Student Assistant. You can chat with me, upload documents to ask questions about them, generate quizzes, or create study plans. How can I help you today?',
      timestamp: new Date()
    }]);
  }, [location.state]);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const createSession = async () => {
    try {
      const response = await api.post('/chat/session', {});
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSend = async () => {
    if (!message.trim() && messageType === 'chat') return;
    if (!sessionId) return;

    setLoading(true);
    const prompt = message || (messageType === 'quiz' ? 'Generate a quiz' : 'Create a study plan');
    setMessages((prev) => [...prev, { role: 'user', content: prompt, timestamp: new Date() }]);

    try {
      const response = await api.post('/chat/message', {
        sessionId,
        message: prompt,
        documentIds: selectedDocs,
        messageType,
        chatMode
      });

      const aiMessage = {
        ...response.data.message,
        sources: response.data.sources || response.data.message?.context?.sources || []
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (response.data.quiz) setQuiz(response.data.quiz);
      if (response.data.studyPlan) setStudyPlan(response.data.studyPlan);
      setMessage('');
      setMessageType('chat');
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleDocumentSelection = (docId) => {
    setSelectedDocs((prev) => prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]);
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
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDocs((prev) => [...prev, newDoc._id]);
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

  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const messageResults = messages.filter((msg) =>
      msg.content.toLowerCase().includes(query.toLowerCase())
    ).map((msg) => ({
      title: msg.content.substring(0, 50) + '...',
      type: 'Chat Message',
      date: new Date(msg.timestamp).toLocaleDateString()
    }));
    const docResults = documents.filter((doc) =>
      (doc.fileName || '').toLowerCase().includes(query.toLowerCase())
    ).map((doc) => ({
      title: doc.fileName,
      type: 'Document',
      date: 'Uploaded'
    }));
    setSearchResults([...messageResults, ...docResults]);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const renderQuiz = () => {
    const questions = Array.isArray(quiz) ? quiz : quiz?.questions;
    if (!questions || !Array.isArray(questions)) return null;
    return (
      <div className="results-list">
        <div className="result-card">
          <strong>Generated Quiz</strong>
          <p className="doc-meta">{questions.length} questions</p>
        </div>
        {questions.map((q, index) => (
          <div key={index} className="result-card">
            <p><strong>{index + 1}. {q.question}</strong></p>
            {Array.isArray(q.options) && q.options.map((option, i) => (
              <p key={i} className="doc-meta">
                {String.fromCharCode(65 + i)}. {option}{i === (q.correctAnswer ?? q.correct) ? ' (Correct)' : ''}
              </p>
            ))}
            {q.explanation ? <p className="doc-meta">Explanation: {q.explanation}</p> : null}
          </div>
        ))}
      </div>
    );
  };

  const renderStudyPlan = () => {
    if (!studyPlan) return null;
    return (
      <div className="results-list">
        <div className="result-card">
          <strong>{studyPlan.title || 'Study Plan'}</strong>
          <p className="doc-meta">Duration: {studyPlan.totalDuration || 'Custom'}</p>
        </div>
        {(studyPlan.schedule || []).slice(0, 4).map((day, index) => (
          <div key={index} className="result-card">
            <p><strong>Day {day.day}</strong> <span className="doc-meta">{day.date}</span></p>
            {(day.sessions || []).map((session, i) => (
              <p key={i} className="doc-meta">{session.time} - {session.topic}</p>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const modeTitle = messageType === 'chat' ? 'Chat' : messageType === 'quiz' ? 'Quiz Generation' : 'Study Plan';
  const requiresDocs = messageType === 'quiz' || messageType === 'study-plan' || (messageType === 'chat' && chatMode === 'docs');
  const sendDisabled = (messageType === 'chat' && !message.trim()) || loading || (requiresDocs && selectedDocs.length === 0);

  return (
    <div className="workspace-page">
      <Header onSearch={handleSearch} searchResults={searchResults} />
      <div className="workspace-shell">
        <div className="workspace-layout">
          <aside className="workspace-card workspace-sidebar">
            <div className="workspace-title">
              <div className="workspace-icon docs"><Sparkles size={18} /></div>
              <div>
                <h1>AI Workspace</h1>
                <p>{sessionId ? 'Connected' : 'Connecting...'}</p>
              </div>
            </div>

            <section>
              <h3 className="panel-title">Documents</h3>
              <div
                {...getRootProps()}
                className={`dropzone-modern ${isDragActive ? 'active' : ''} ${uploading ? 'pointer-events-none' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload size={18} />
                <p className="doc-meta">{uploading ? 'Uploading...' : 'Drop files or click to upload'}</p>
                <p className="doc-meta">PDF, DOCX, PPT, PPTX, TXT up to 10MB</p>
              </div>
            </section>

            <section>
              <h3 className="panel-title">Selected ({selectedDocs.length})</h3>
              <div className="doc-list">
                {documents.map((doc) => (
                  <label key={doc._id} className={`doc-item ${selectedDocs.includes(doc._id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc._id)}
                      onChange={() => toggleDocumentSelection(doc._id)}
                    />
                    <FileText size={16} />
                    <span title={doc.fileName}>{doc.fileName}</span>
                  </label>
                ))}
                {documents.length === 0 && <p className="doc-meta">No documents yet.</p>}
              </div>
            </section>

            <section>
              <h3 className="panel-title">Mode</h3>
              <div className="mode-actions">
                <button className={`mode-btn ${messageType === 'chat' ? 'active chat' : ''}`} onClick={() => setMessageType('chat')}>Chat</button>
                <button className={`mode-btn ${messageType === 'quiz' ? 'active quiz' : ''}`} onClick={() => setMessageType('quiz')}>Quiz</button>
                <button className={`mode-btn ${messageType === 'study-plan' ? 'active plan' : ''}`} onClick={() => setMessageType('study-plan')}>Study Plan</button>
              </div>
              {messageType === 'chat' && (
                <select className="field-input" style={{ marginTop: '0.65rem' }} value={chatMode} onChange={(e) => setChatMode(e.target.value)}>
                  <option value="auto">Auto (Smart)</option>
                  <option value="docs">Documents only</option>
                  <option value="web">Internet only</option>
                  <option value="hybrid">Docs + Internet</option>
                </select>
              )}
            </section>
          </aside>

          <section className="workspace-card workspace-main chat-main">
            <div className="chat-topbar">
              <div>
                <strong>{modeTitle}</strong>
                <p className="doc-meta">{selectedDocs.length} document(s) selected{messageType === 'chat' ? ` | ${chatMode}` : ''}</p>
              </div>
              <span className="badge">{loading ? 'Working...' : 'Ready'}</span>
            </div>

            <div className="chat-scroll">
              {messages.length === 0 && !quiz && !studyPlan && (
                <div className="result-card">
                  <strong>Start with a message</strong>
                  <p className="doc-meta">Use chat, or switch to quiz/study plan mode.</p>
                </div>
              )}
              {renderQuiz()}
              {renderStudyPlan()}
              {messages.map((msg, index) => (
                <div key={index} className={`bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  <p>{msg.content}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="doc-meta">
                      Sources: {msg.sources.length}
                      {msg.sources.filter((src) => src.url).slice(0, 3).map((src, srcIndex) => (
                        <div key={`${index}-src-${srcIndex}`}>
                          <a href={src.url} target="_blank" rel="noopener noreferrer">{src.title || src.url}</a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrap">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={messageType === 'chat' ? (chatMode === 'docs' ? 'Ask a question about selected documents' : chatMode === 'web' ? 'Ask any real-world question' : chatMode === 'hybrid' ? 'Ask using both documents and internet context' : 'Ask anything (auto mode picks best source)') : `Press ${messageType === 'quiz' ? 'Generate' : 'Create'} to continue`}
                className="chat-input"
                disabled={messageType !== 'chat'}
              />
              <button
                onClick={() => {
                  if (!speechSupported) return;
                  if (isListening) {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                  } else {
                    try {
                      recognitionRef.current?.start();
                      setIsListening(true);
                    } catch (error) {
                      console.error('Failed to start speech recognition:', error);
                    }
                  }
                }}
                disabled={!speechSupported}
                className="btn-modern"
                title={speechSupported ? 'Voice input' : 'Voice not supported'}
              >
                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
              <button
                onClick={handleSend}
                disabled={sendDisabled}
                className={`btn-modern ${messageType === 'quiz' ? 'quiz' : messageType === 'study-plan' ? 'plan' : ''}`}
              >
                {loading ? '...' : messageType === 'chat' ? <Send size={17} /> : messageType === 'quiz' ? <Brain size={17} /> : <Calendar size={17} />}
                {!loading && (messageType === 'chat' ? 'Send' : messageType === 'quiz' ? 'Generate' : 'Create')}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Chat;
