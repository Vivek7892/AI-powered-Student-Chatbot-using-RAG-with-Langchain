import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Brain, FileText, CheckCircle, Upload, Plus, Play, Clock, Target } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';

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
      setDocuments(response.data);
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
        
        setDocuments(prev => [...prev, newDoc]);
        setSelectedDocs(prev => [...prev, newDoc._id]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    
    setUploading(false);
    setTimeout(() => loadDocuments(), 1000);
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
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">AI Quiz Generator</h1>
                  <p className="text-sm font-bold text-black">Generate intelligent quizzes from your documents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-8 rounded-lg font-bold text-lg text-black ${
                activeTab === 'upload'
                  ? 'bg-blue-600'
                  : 'bg-blue-400'
              }`}
            >
              Upload Documents
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-4 px-8 rounded-lg font-bold text-lg text-black ${
                activeTab === 'generate'
                  ? 'bg-blue-600'
                  : 'bg-blue-400'
              }`}
            >
              Generate Quiz
            </button>
          </div>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-bold text-black">Upload Documents</h3>
                <p className="mt-1 text-sm font-bold text-black">Upload your study materials to generate quizzes</p>
              </div>
              <div className="p-6">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer transition-colors ${
                    uploading ? 'opacity-50 pointer-events-none' : ''
                  } ${
                    isDragActive ? 'border-blue-400 bg-blue-50' : 'hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center">
                    <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                      <Upload className="w-12 h-12" />
                    </div>
                    
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-bold text-black mb-2">Uploading...</p>
                        <p className="font-bold text-black">Processing your documents</p>
                      </div>
                    ) : isDragActive ? (
                      <div>
                        <p className="text-lg font-bold text-black mb-2">Drop files here</p>
                        <p className="font-bold text-black">Release to upload your documents</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-bold text-black mb-3">
                          Drag and drop files here, or click to select files
                        </p>
                        <p className="font-bold text-black mb-6">
                          Supports PDF, DOCX, TXT files up to 10MB
                        </p>
                        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                          <Plus className="w-4 h-4 mr-2" />
                          Select Files
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Document Selection */}
            {documents.length > 0 && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-bold text-black">Select Documents</h3>
                  <p className="mt-1 text-sm font-bold text-black">Choose which documents to use for quiz generation</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {documents.map((doc) => (
                      <label key={doc._id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedDocs.includes(doc._id) 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="checkbox"
                          checked={selectedDocs.includes(doc._id)}
                          onChange={() => toggleDocument(doc._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <FileText className="w-5 h-5 text-gray-400 ml-3" />
                        <div className="flex-1 min-w-0 ml-3">
                          <p className="text-sm font-bold text-black truncate">{doc.fileName}</p>
                          <p className="text-sm font-bold text-black">Ready for quiz generation</p>
                        </div>
                        {selectedDocs.includes(doc._id) && (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        )}
                      </label>
                    ))}
                  </div>
                  
                  {selectedDocs.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setActiveTab('generate')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Continue ({selectedDocs.length} selected)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Quiz Tab */}
        {activeTab === 'generate' && (
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-bold text-black">Generate Quiz</h3>
                <p className="mt-1 text-sm font-bold text-black">Configure and generate your AI-powered quiz</p>
              </div>
              <div className="p-6">
                {selectedDocs.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-bold text-black">No documents selected</h3>
                    <p className="mt-1 text-sm font-bold text-black">Get started by uploading and selecting documents.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Upload
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h4 className="text-base font-bold text-black mb-4">Quiz Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">
                            Number of Questions
                          </label>
                          <select
                            value={quizSettings.numQuestions}
                            onChange={(e) => setQuizSettings({...quizSettings, numQuestions: Number(e.target.value)})}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md font-bold text-black"
                          >
                            <option value={5} className="font-bold text-black">5 Questions</option>
                            <option value={10} className="font-bold text-black">10 Questions</option>
                            <option value={15} className="font-bold text-black">15 Questions</option>
                            <option value={20} className="font-bold text-black">20 Questions</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">
                            Difficulty Level
                          </label>
                          <select
                            value={quizSettings.difficulty}
                            onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md font-bold text-black"
                          >
                            <option value="easy" className="font-bold text-black">Easy</option>
                            <option value="medium" className="font-bold text-black">Medium</option>
                            <option value="hard" className="font-bold text-black">Hard</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">
                            Question Type
                          </label>
                          <select
                            value={quizSettings.questionType}
                            onChange={(e) => setQuizSettings({...quizSettings, questionType: e.target.value})}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md font-bold text-black"
                          >
                            <option value="multiple-choice" className="font-bold text-black">Multiple Choice</option>
                            <option value="true-false" className="font-bold text-black">True/False</option>
                            <option value="mixed" className="font-bold text-black">Mixed</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={generateQuiz}
                          disabled={loading}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Generating Quiz...
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4 mr-2" />
                              Generate Quiz
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Quiz Display */}
                    {quiz && (
                      <div className="mt-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h4 className="text-lg font-bold text-black mb-4">{quiz.title}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center text-sm font-bold text-black">
                              <Target className="w-4 h-4 mr-2" />
                              Questions: {quiz.totalQuestions}
                            </div>
                            <div className="flex items-center text-sm font-bold text-black">
                              <Clock className="w-4 h-4 mr-2" />
                              Difficulty: {quiz.difficulty}
                            </div>
                            <div className="flex items-center text-sm font-bold text-black">
                              <FileText className="w-4 h-4 mr-2" />
                              Type: {quiz.questionType}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-4">
                          {quiz.questions && quiz.questions.map((question, index) => (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                              <h5 className="font-bold text-black mb-4">
                                Question {index + 1}: {question.question}
                              </h5>
                              
                              {question.type === 'multiple-choice' && (
                                <div className="space-y-2">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center">
                                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3 flex items-center justify-center">
                                        <span className="text-sm font-bold text-black">{String.fromCharCode(65 + optIndex)}</span>
                                      </div>
                                      <span className="font-bold text-black">{option}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {question.type === 'true-false' && (
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                                    <span className="font-bold text-black">True</span>
                                  </div>
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                                    <span className="font-bold text-black">False</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default QuizGenerator;
