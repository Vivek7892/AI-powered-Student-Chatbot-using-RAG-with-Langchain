import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Search, Grid, List, CheckCircle2, Clock3 } from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';
import './WorkspaceModern.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchResults, setSearchResults] = useState([]);

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
    setError(null);
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
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        setError(`Upload failed for ${file.name}: ${errorMessage}`);
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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = documents.filter((doc) =>
      (doc.fileName || doc.name || '').toLowerCase().includes(query.toLowerCase())
    ).map((doc) => ({
      title: doc.fileName || doc.name,
      type: 'Document',
      date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Recently'
    }));
    setSearchResults(results);
  };

  const filteredDocuments = documents.filter((doc) => {
    const fileName = (doc.fileName || doc.name || '').toLowerCase();
    const matchesSearch = fileName.includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'pdf' && fileName.endsWith('.pdf')) ||
      (filterType === 'docx' && fileName.endsWith('.docx')) ||
      (filterType === 'txt' && fileName.endsWith('.txt'));
    return matchesSearch && matchesFilter;
  });

  const renderDocumentCard = (doc) => {
    const fileName = doc.fileName || doc.name || 'Untitled Document';
    const uploadedOn = doc.createdAt || doc.uploadDate;
    return (
      <div key={doc._id || fileName} className="doc-card">
        <h4 title={fileName}>{fileName}</h4>
        <p className="doc-meta">{formatFileSize(doc.fileSize || doc.size)}</p>
        <p className="doc-meta">{uploadedOn ? new Date(uploadedOn).toLocaleDateString() : 'Recently uploaded'}</p>
        <span className={`status-pill ${doc.processed ? 'ready' : 'processing'}`}>
          {doc.processed ? <CheckCircle2 size={12} style={{ marginRight: '0.25rem' }} /> : <Clock3 size={12} style={{ marginRight: '0.25rem' }} />}
          {doc.processed ? 'Ready' : 'Processing'}
        </span>
      </div>
    );
  };

  return (
    <div className="workspace-page">
      <Header onSearch={handleSearch} searchResults={searchResults} />
      <main className="workspace-shell">
        <section className="workspace-card workspace-main">
          <div className="workspace-header">
            <div className="workspace-title">
              <div className="workspace-icon docs"><FileText size={18} /></div>
              <div>
                <h1>Document Manager</h1>
                <p>Upload, search, and manage your study files</p>
              </div>
            </div>
          </div>

          <div className="docs-toolbar">
            <div className="docs-filter">
              <div style={{ position: 'relative', minWidth: '230px' }}>
                <Search size={16} style={{ position: 'absolute', top: '10px', left: '10px', color: '#64748b' }} />
                <input
                  className="field-input"
                  style={{ paddingLeft: '2rem' }}
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search documents"
                />
              </div>
              <select className="field-input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All files</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="txt">TXT</option>
              </select>
            </div>
            <div className="docs-filter">
              <button className="workspace-back" onClick={() => setViewMode('grid')}><Grid size={16} /></button>
              <button className="workspace-back" onClick={() => setViewMode('list')}><List size={16} /></button>
            </div>
          </div>

          {error && <div className="result-card" style={{ marginTop: '0.8rem', borderColor: '#fecaca', color: '#b91c1c' }}>{error}</div>}

          <div style={{ marginTop: '0.9rem' }}>
            <div {...getRootProps()} className={`dropzone-modern ${isDragActive ? 'active' : ''} ${uploading ? 'pointer-events-none' : ''}`}>
              <input {...getInputProps()} />
              <Upload size={18} />
              <p className="doc-meta">{uploading ? 'Uploading...' : 'Drag and drop documents or click to browse'}</p>
              <p className="doc-meta">PDF, DOCX, TXT up to 10MB</p>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {filteredDocuments.length === 0 ? (
              <div className="result-card">
                <strong>No documents found</strong>
                <p className="doc-meta">Try another search/filter or upload a new file.</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="docs-grid">
                {filteredDocuments.map((doc) => renderDocumentCard(doc))}
              </div>
            ) : (
              <div className="results-list">
                {filteredDocuments.map((doc) => renderDocumentCard(doc))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Documents;
