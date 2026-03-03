import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, Clock, CheckCircle, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import './WorkspaceModern.css';

const StudyPlanner = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [duration, setDuration] = useState(7);
  const [activeTab, setActiveTab] = useState('upload');

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

  const generateStudyPlan = async () => {
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
        message: `Create a ${duration} day study plan`,
        documentIds: selectedDocs,
        messageType: 'study-plan'
      });
      if (response.data.studyPlan) {
        setStudyPlan(response.data.studyPlan);
      } else {
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
    <div className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-header">
          <div className="workspace-title">
            <Link to="/" className="workspace-back"><ArrowLeft size={16} /></Link>
            <div className="workspace-icon plan"><Calendar size={18} /></div>
            <div>
              <h1>Study Planner</h1>
              <p>Generate a day-by-day plan from your notes</p>
            </div>
          </div>
          <div className="tabs-modern">
            <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>Upload</button>
            <button className={activeTab === 'plan' ? 'active' : ''} onClick={() => setActiveTab('plan')}>Plan</button>
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
              <>
                <h3 className="panel-title">Review Selection</h3>
                <div className="result-card">
                  <p><strong>{selectedDocs.length}</strong> document(s) selected</p>
                  <p className="doc-meta">Switch to Plan tab to generate your study schedule.</p>
                </div>
              </>
            )}

            {activeTab === 'plan' && (
              <>
                {selectedDocs.length === 0 ? (
                  <div className="result-card">
                    <p><strong>No documents selected</strong></p>
                    <p className="doc-meta">Choose at least one document from the left panel.</p>
                  </div>
                ) : (
                  <>
                    <div className="result-card">
                      <label className="field-label">Study Duration</label>
                      <select className="field-input" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                        <option value={3}>3 days - Quick Review</option>
                        <option value={5}>5 days - Standard</option>
                        <option value={7}>7 days - Comprehensive</option>
                        <option value={14}>14 days - Detailed Study</option>
                        <option value={30}>30 days - In-depth Learning</option>
                      </select>
                      <div style={{ marginTop: '0.8rem' }}>
                        <button className="btn-modern plan" onClick={generateStudyPlan} disabled={loading}>
                          <Calendar size={16} />
                          {loading ? 'Generating...' : 'Generate Plan'}
                        </button>
                      </div>
                    </div>

                    {studyPlan && (
                      <div className="results-list">
                        <div className="result-card">
                          <strong>{studyPlan.title}</strong>
                          <p className="doc-meta">Duration: {studyPlan.totalDuration}</p>
                        </div>
                        {(studyPlan.schedule || []).map((day) => (
                          <div key={day.day} className="result-card">
                            <p><strong>Day {day.day}</strong> <span className="doc-meta">{day.date}</span></p>
                            {(day.sessions || []).map((session, i) => (
                              <div key={i} className="doc-meta" style={{ marginTop: '0.35rem' }}>
                                <Clock size={14} style={{ marginRight: '0.35rem', verticalAlign: 'text-bottom' }} />
                                {session.time} - {session.topic}
                                {(session.activities || []).map((activity, idx) => (
                                  <p key={idx} className="doc-meta">
                                    <CheckCircle size={12} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />
                                    {activity}
                                  </p>
                                ))}
                              </div>
                            ))}
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

export default StudyPlanner;
