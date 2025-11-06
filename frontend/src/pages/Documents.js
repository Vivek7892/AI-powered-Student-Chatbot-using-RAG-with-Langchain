import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, Search, Filter, Grid, List, Download, Eye, ArrowLeft, Plus, FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

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
      console.log('Uploading file:', file.name, file.size, file.type);
      
      const formData = new FormData();
      formData.append('document', file);
      
      try {
        console.log('Making upload request...');
        const response = await api.post('/documents/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('Upload response:', response.data);
        const result = response.data;
        const newDoc = {
          _id: result.documentId,
          fileName: file.name,
          fileSize: file.size,
          processed: result.processed,
          createdAt: new Date().toISOString()
        };
        setDocuments(prev => [...prev, newDoc]);
        
        // Reload documents to get updated list
        setTimeout(() => loadDocuments(), 1000);
      } catch (error) {
        console.error('Upload failed:', error);
        const errorMessage = error.response?.data?.error || error.message;
        setError(`Upload failed for ${file.name}: ${errorMessage}`);
      }
    }
    
    setUploading(false);
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
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc => {
    if (!doc || !doc.name) return false;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
      (filterType === 'pdf' && doc.name.toLowerCase().endsWith('.pdf')) ||
      (filterType === 'docx' && doc.name.toLowerCase().endsWith('.docx')) ||
      (filterType === 'txt' && doc.name.toLowerCase().endsWith('.txt'));
    return matchesSearch && matchesFilter;
  });

  const getFileIcon = (fileName) => {
    if (!fileName) return '📄';
    const ext = fileName.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📃';
      default: return '📄';
    }
  };

  const getFileColor = (fileName) => {
    if (!fileName) return 'from-green-500 to-emerald-600';
    const ext = fileName.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return 'from-red-500 to-red-600';
      case 'docx': return 'from-blue-500 to-blue-600';
      case 'txt': return 'from-gray-500 to-gray-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 animate-fadeIn">
      {/* Header */}
      <header className="glass-effect shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl transition-all duration-200">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Document Manager
                </h1>
                <p className="text-sm text-slate-500 font-medium">Organize your study materials</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/files" className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 transition-all duration-200">
                <FolderOpen size={16} />
                <span className="text-sm font-medium">Admin Files</span>
              </Link>
              <div className="flex items-center space-x-2 bg-white/70 rounded-xl px-4 py-2">
                <span className="text-sm font-medium text-slate-700">{documents.length} documents</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Search and Filter Bar */}
        <div className="card mb-8 animate-slideIn">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Files</option>
                  <option value="pdf">PDF Files</option>
                  <option value="docx">Word Documents</option>
                  <option value="txt">Text Files</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-green-100 text-green-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-green-100 text-green-600' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
          
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm animate-slideIn">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}
          
        {/* Upload Area */}
        <div className="card mb-8 animate-slideIn" style={{animationDelay: '0.1s'}}>
          <div 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 group ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            } ${
              isDragActive ? 'border-green-400 bg-green-50 scale-[1.02]' : 'border-slate-300 hover:border-green-400 hover:bg-green-50/50'
            }`}
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
                  <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-lg font-bold text-green-600 mb-1">Uploading...</p>
                  <p className="text-slate-600 text-sm">Processing your documents</p>
                </div>
              ) : isDragActive ? (
                <div>
                  <p className="text-lg font-bold text-green-600 mb-1">Drop files here!</p>
                  <p className="text-slate-600 text-sm">Release to upload your documents</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    Drag & drop documents or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    PDF, DOCX, TXT • Max 10MB per file
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents Grid/List */}
        <div className="animate-slideIn" style={{animationDelay: '0.2s'}}>
          {filteredDocuments.length === 0 ? (
            <div className="card">
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  {searchTerm || filterType !== 'all' ? 'No matching documents' : 'No documents yet'}
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first document to start building your AI-powered knowledge base'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <button className="btn-primary inline-flex items-center space-x-2" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Plus size={18} />
                    <span>Upload First Document</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredDocuments.map((doc, index) => (
                viewMode === 'grid' ? (
                  <div key={doc.id} className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${getFileColor(doc.name)} rounded-xl flex items-center justify-center text-2xl`}>
                          {getFileIcon(doc.name)}
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                            <Download size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2 truncate" title={doc.fileName || doc.name}>{doc.fileName || doc.name}</h4>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{formatFileSize(doc.fileSize || doc.size)}</span>
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          doc.processed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            doc.processed ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
                          }`}></div>
                          <span>{doc.processed ? 'Ready' : 'Processing'}</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          Uploaded {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={doc.id} className="card group hover:shadow-lg transition-all duration-300 animate-slideIn" style={{animationDelay: `${index * 0.05}s`}}>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 bg-gradient-to-r ${getFileColor(doc.name)} rounded-lg flex items-center justify-center text-lg`}>
                            {getFileIcon(doc.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">{doc.fileName || doc.name}</h4>
                            <div className="flex items-center space-x-3 text-sm text-slate-600">
                              <span>{formatFileSize(doc.fileSize || doc.size)}</span>
                              <span>•</span>
                              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                doc.processed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  doc.processed ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
                                }`}></div>
                                <span>{doc.processed ? 'Ready' : 'Processing'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                            <Eye size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                            <Download size={16} />
                          </button>
                          <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;
