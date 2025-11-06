import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Clock, CheckCircle, Upload, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';

const StudyPlanner = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(7);
  const [activeTab, setActiveTab] = useState('upload');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const generateStudyPlan = async () => {
    if (selectedDocs.length === 0) {
      alert('Please select at least one document');
      return;
    }

    setLoading(true);
    try {
      // Create session first
      const sessionResponse = await api.post('/chat/session', {});
      const sessionId = sessionResponse.data.sessionId;
      
      // Send study plan message
      const response = await api.post('/chat/message', {
        sessionId,
        message: `Create a ${duration} day study plan`,
        documentIds: selectedDocs,
        messageType: 'study-plan'
      });
      
      console.log('Study plan response:', response.data);
      
      if (response.data.studyPlan) {
        setStudyPlan(response.data.studyPlan);
      } else {
        console.error('No study plan in response');
        alert('Failed to generate study plan. Please try again.');
      }
    } catch (error) {
      console.error('Failed to generate study plan:', error);
      alert('Error generating study plan: ' + (error.response?.data?.error || error.message));
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
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">Study Planner</h1>
                  <p className="text-sm font-bold text-black">Create personalized study schedules</p>
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
              onClick={() => setActiveTab('plan')}
              className={`py-4 px-8 rounded-lg font-bold text-lg text-black ${
                activeTab === 'plan'
                  ? 'bg-blue-600'
                  : 'bg-blue-400'
              }`}
            >
              Generate Plan
            </button>
          </div>
        </div>

        {/* Upload & Select Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-bold text-black">Upload Documents</h3>
                <p className="mt-1 text-sm font-bold text-black">Upload your study materials to generate a personalized plan</p>
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
                  <p className="mt-1 text-sm font-bold text-black">Choose which documents to include in your study plan</p>
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
                          <p className="text-sm font-bold text-black">Ready for planning</p>
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
                        onClick={() => setActiveTab('plan')}
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

        {/* Study Plan Tab */}
        {activeTab === 'plan' && (
          <div>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-bold text-black">Generate Study Plan</h3>
                <p className="mt-1 text-sm font-bold text-black">Create a personalized learning schedule</p>
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
                      <h4 className="text-base font-bold text-black mb-4">Plan Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">
                            Selected Documents ({selectedDocs.length})
                          </label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {documents.filter(doc => selectedDocs.includes(doc._id)).map(doc => (
                              <div key={doc._id} className="flex items-center text-sm font-bold text-black">
                                <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                                <span className="truncate">{doc.fileName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-black mb-2">
                            Study Duration
                          </label>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md font-bold text-black"
                          >
                            <option value={3} className="font-bold text-black">3 days - Quick Review</option>
                            <option value={5} className="font-bold text-black">5 days - Standard</option>
                            <option value={7} className="font-bold text-black">7 days - Comprehensive</option>
                            <option value={14} className="font-bold text-black">14 days - Detailed Study</option>
                            <option value={30} className="font-bold text-black">30 days - In-depth Learning</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          onClick={generateStudyPlan}
                          disabled={loading}
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Generating Plan...
                            </>
                          ) : (
                            'Generate Study Plan'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Study Plan Display */}
                    {studyPlan && (
                      <div className="mt-8">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h4 className="text-lg font-bold text-black mb-4">{studyPlan.title}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center text-sm font-bold text-black">
                              <Calendar className="w-4 h-4 mr-2" />
                              Duration: {studyPlan.totalDuration}
                            </div>
                            <div className="flex items-center text-sm font-bold text-black">
                              <FileText className="w-4 h-4 mr-2" />
                              Documents: {studyPlan.documentsIncluded}
                            </div>
                            <div className="flex items-center text-sm font-bold text-black">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Topics: {studyPlan.totalTopics || 'Multiple'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-6 space-y-4">
                          {studyPlan.schedule.map((day) => (
                            <div key={day.day} className="bg-white border border-gray-200 rounded-lg p-6">
                              <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-semibold">
                                  {day.day}
                                </div>
                                <div className="ml-4">
                                  <h5 className="text-lg font-bold text-black">Day {day.day}</h5>
                                  <p className="text-sm font-bold text-black">{day.date}</p>
                                  {day.dayTitle && <p className="text-sm font-bold text-black">{day.dayTitle}</p>}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                {day.sessions.map((session, i) => (
                                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center mb-3">
                                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                      <span className="font-bold text-black">{session.time}</span>
                                      {session.source && <span className="ml-2 text-xs bg-blue-100 font-bold text-black px-2 py-1 rounded-full">{session.source}</span>}
                                    </div>
                                    <h6 className="font-bold text-black mb-3">{session.topic}</h6>
                                    <ul className="space-y-2">
                                      {session.activities.map((activity, j) => (
                                        <li key={j} className="text-sm font-bold text-black flex items-start">
                                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
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

export default StudyPlanner;
