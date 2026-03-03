import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, FileText, CheckCircle, Upload, Target, Clock } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import './WorkspaceModern.css';

const QuizGenerator = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [quizSettings, setQuizSettings] = useState({
    numQuestions: 10,
    difficulty: 'medium',
    questionType: 'multiple-choice'
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
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
          fileSize: file.size,
          processed: response.data.processed,
          createdAt: new Date().toISOString()
        };
        setDocuments((prev) => [...prev, newDoc]);
        setSelectedDocs((prev) => [...prev, newDoc._id]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    setUploading(false);
    setTimeout(() => loadDocuments(), 700);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024
  });

  const toggleDocument = (docId) => {
    setSelectedDocs((prev) => prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]);
  };

  const generateQuiz = async () => {
    if (selectedDocs.length === 0) {
      alert('Please select at least one document');
      return;
    }
    setLoading(true);
    try {
      const sessionResponse = await api.post('/chat/session', {});
      const sessionId = sessionResponse.data.sessionId;
      const response = await api.post('/chat/message', {
        sessionId,
        message: `Generate a ${quizSettings.difficulty} difficulty quiz with ${quizSettings.numQuestions} ${quizSettings.questionType} questions`,
        documentIds: selectedDocs,
        messageType: 'quiz-generation'
      });
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
      } else {
        alert('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      alert('Error generating quiz: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-header">
          <div className="workspace-title">
            <Link to="/" className="workspace-back"><ArrowLeft size={16} /></Link>
            <div className="workspace-icon quiz"><Brain size={18} /></div>
            <div>
              <h1>Quiz Generator</h1>
              <p>Create practice quizzes from selected documents</p>
            </div>
          </div>
          <div className="tabs-modern">
            <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>Upload</button>
            <button className={activeTab === 'generate' ? 'active' : ''} onClick={() => setActiveTab('generate')}>Generate</button>
          </div>
        </div>

        <div className="split-layout">
          <section className="workspace-card workspace-sidebar">
            <h3 className="panel-title">Documents</h3>
            <div {...getRootProps()} className={`dropzone-modern ${isDragActive ? 'active' : ''} ${uploading ? 'pointer-events-none' : ''}`}>
              <input {...getInputProps()} />
              <Upload size={18} />
              <p className="doc-meta">{uploading ? 'Uploading...' : 'Drop files or click to upload'}</p>
            </div>
            <div className="doc-list">
              {documents.map((doc) => (
                <label key={doc._id} className={`doc-item ${selectedDocs.includes(doc._id) ? 'selected' : ''}`}>
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc._id)}
                    onChange={() => toggleDocument(doc._id)}
                  />
                  <FileText size={16} />
                  <span title={doc.fileName}>{doc.fileName}</span>
                </label>
              ))}
              {documents.length === 0 && <p className="doc-meta">No documents available.</p>}
            </div>
          </section>

          <section className="workspace-card workspace-main">
            {activeTab === 'upload' && (
              <div className="result-card">
                <p><strong>{selectedDocs.length}</strong> document(s) selected</p>
                <p className="doc-meta">Move to Generate tab after selecting your files.</p>
              </div>
            )}

            {activeTab === 'generate' && (
              <>
                {selectedDocs.length === 0 ? (
                  <div className="result-card">
                    <p><strong>No documents selected</strong></p>
                    <p className="doc-meta">Choose at least one document from the left panel.</p>
                  </div>
                ) : (
                  <>
                    <div className="result-card">
                      <h3 className="panel-title">Quiz Settings</h3>
                      <div className="config-grid">
                        <div>
                          <label className="field-label">Questions</label>
                          <select
                            className="field-input"
                            value={quizSettings.numQuestions}
                            onChange={(e) => setQuizSettings({ ...quizSettings, numQuestions: Number(e.target.value) })}
                          >
                            <option value={5}>5 Questions</option>
                            <option value={10}>10 Questions</option>
                            <option value={15}>15 Questions</option>
                            <option value={20}>20 Questions</option>
                          </select>
                        </div>
                        <div>
                          <label className="field-label">Difficulty</label>
                          <select
                            className="field-input"
                            value={quizSettings.difficulty}
                            onChange={(e) => setQuizSettings({ ...quizSettings, difficulty: e.target.value })}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="field-label">Type</label>
                          <select
                            className="field-input"
                            value={quizSettings.questionType}
                            onChange={(e) => setQuizSettings({ ...quizSettings, questionType: e.target.value })}
                          >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True/False</option>
                            <option value="mixed">Mixed</option>
                          </select>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.85rem' }}>
                        <button className="btn-modern quiz" onClick={generateQuiz} disabled={loading}>
                          <Brain size={16} />
                          {loading ? 'Generating...' : 'Generate Quiz'}
                        </button>
                      </div>
                    </div>

                    {quiz && (
                      <div className="results-list">
                        <div className="result-card">
                          <strong>{quiz.title || 'Generated Quiz'}</strong>
                          <p className="doc-meta"><Target size={14} style={{ verticalAlign: 'text-bottom' }} /> Questions: {quiz.totalQuestions || quiz.questions?.length || 0}</p>
                          <p className="doc-meta"><Clock size={14} style={{ verticalAlign: 'text-bottom' }} /> Difficulty: {quiz.difficulty || quizSettings.difficulty}</p>
                        </div>
                        {(quiz.questions || []).map((question, index) => (
                          <div key={index} className="result-card">
                            <p><strong>Q{index + 1}. {question.question}</strong></p>
                            {question.options?.map((option, optIndex) => (
                              <p key={optIndex} className="doc-meta">
                                {String.fromCharCode(65 + optIndex)}. {option}
                              </p>
                            ))}
                            {question.answer && (
                              <p className="doc-meta">
                                <CheckCircle size={12} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />
                                Answer: {question.answer}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
