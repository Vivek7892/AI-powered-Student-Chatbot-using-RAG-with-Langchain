import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Calendar, AlertTriangle, Brain, Search, Filter, ArrowLeft, FolderOpen } from 'lucide-react';
import axios from 'axios';
import './Files.css';

const Files = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState({
    notes: [],
    importantNotes: [],
    timetables: [],
    mcqTests: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchFiles();
  }, [user?.semester]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const semester = user?.semester;
      
      if (semester) {
        // Fetch semester-specific content
        const response = await axios.get(`http://localhost:5001/api/admin/semester/${semester}`);
        setFiles(response.data);
      } else {
        // Fetch all content if no semester set
        const [notesRes, importantRes, timetablesRes, mcqRes] = await Promise.all([
          axios.get('http://localhost:5001/api/admin/notes'),
          axios.get('http://localhost:5001/api/admin/important-notes'),
          axios.get('http://localhost:5001/api/admin/timetables'),
          axios.get('http://localhost:5001/api/admin/mcq-tests')
        ]);
        
        setFiles({
          notes: notesRes.data,
          importantNotes: importantRes.data,
          timetables: timetablesRes.data,
          mcqTests: mcqRes.data
        });
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (type, id, filename) => {
    const url = `http://localhost:5001/api/admin/download/${type}/${id}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredFiles = () => {
    const allFiles = [
      ...files.notes.map(f => ({ ...f, type: 'note', icon: FileText, color: 'blue' })),
      ...files.importantNotes.map(f => ({ ...f, type: 'important', icon: AlertTriangle, color: 'red' })),
      ...files.timetables.map(f => ({ ...f, type: 'timetable', icon: Calendar, color: 'green' })),
      ...files.mcqTests.map(f => ({ ...f, type: 'mcq', icon: Brain, color: 'purple' }))
    ];

    return allFiles.filter(file => {
      const matchesSearch = file.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           file.message?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || file.type === filterType;
      return matchesSearch && matchesFilter;
    });
  };

  if (loading) {
    return (
      <div className="files-page">
        <div className="files-loading">
          <div className="loading-spinner"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  const filteredFiles = getFilteredFiles();

  return (
    <div className="files-page">
      {/* Header */}
      <header className="files-nav-header">
        <div className="files-nav-container">
          <div className="files-nav-left">
            <Link to="/" className="files-back-btn">
              <ArrowLeft size={20} />
            </Link>
            <div className="files-nav-icon">
              <FolderOpen size={24} />
            </div>
            <div className="files-nav-text">
              <h1>Study Files</h1>
              <p>Access admin-uploaded materials</p>
            </div>
          </div>
          <div className="files-nav-right">
            <div className="files-nav-stats">
              <span>{Object.values(files).flat().length} files available</span>
              <div className="files-nav-indicator"></div>
            </div>
          </div>
        </div>
      </header>

      <div className="files-main">
        <div className="files-header">
          <div className="files-title">
            <h2>📁 Study Files</h2>
            <p>Access all your study materials and resources</p>
          </div>
        
        <div className="files-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-box">
            <Filter size={18} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Files</option>
              <option value="note">Study Notes</option>
              <option value="important">Important Notes</option>
              <option value="timetable">Timetables</option>
              <option value="mcq">MCQ Tests</option>
            </select>
          </div>
        </div>
      </div>

      <div className="files-stats">
        <div className="stat-card">
          <span className="stat-number">{files.notes.length}</span>
          <span className="stat-label">Study Notes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{files.importantNotes.length}</span>
          <span className="stat-label">Important Notes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{files.timetables.length}</span>
          <span className="stat-label">Timetables</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{files.mcqTests.length}</span>
          <span className="stat-label">MCQ Tests</span>
        </div>
      </div>

      <div className="files-content">
        {filteredFiles.length === 0 ? (
          <div className="no-files">
            <FileText size={48} />
            <h3>No files found</h3>
            <p>
              {searchTerm || filterType !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No files have been uploaded for your semester yet'
              }
            </p>
          </div>
        ) : (
          <div className="files-grid">
            {filteredFiles.map((file) => {
              const IconComponent = file.icon;
              return (
                <div key={`${file.type}-${file._id}`} className={`file-card file-card--${file.color}`}>
                  <div className="file-card-header">
                    <div className="file-icon">
                      <IconComponent size={20} />
                    </div>
                    <div className="file-type">{file.type.toUpperCase()}</div>
                  </div>
                  
                  <div className="file-content">
                    <h3>{file.title}</h3>
                    <p>{file.description || file.message || file.content?.substring(0, 100)}</p>
                    
                    <div className="file-meta">
                      {file.semester && (
                        <span className="semester-tag">Semester {file.semester}</span>
                      )}
                      {file.priority && (
                        <span className={`priority-tag priority-${file.priority}`}>
                          {file.priority.toUpperCase()}
                        </span>
                      )}
                      <span className="date-tag">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="file-actions">
                    {(file.fileName || file.filePath || file.imagePath) && (
                      <button
                        onClick={() => downloadFile(
                          file.type === 'note' ? 'note' : 
                          file.type === 'important' ? 'important' : 'timetable',
                          file._id,
                          file.fileName || file.title
                        )}
                        className="download-btn"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    )}
                    
                    {file.type === 'timetable' && file.imagePath && (
                      <button
                        onClick={() => window.open(`http://localhost:5001/${file.imagePath}`, '_blank')}
                        className="view-btn"
                      >
                        View
                      </button>
                    )}
                    
                    {file.type === 'mcq' && (
                      <div className="mcq-info">
                        <span>{file.questions?.length || 0} questions</span>
                        <span>{file.timeLimit} min</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Files;
