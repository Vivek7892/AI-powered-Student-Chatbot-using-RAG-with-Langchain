import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Trash2, ArrowLeft, Plus, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const UploadNotes = () => {
  const [notes, setNotes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const response = await api.get('/notes/507f1f77bcf86cd799439011');
      setNotes(response.data || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('note', file);
      formData.append('userId', '507f1f77bcf86cd799439011');
      formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove extension for name
      
      try {
        const response = await api.post('/notes/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const result = response.data;
        setNotes(prev => [...prev, {
          id: result.noteId,
          name: result.name,
          fileName: file.name,
          size: file.size,
          uploadDate: new Date()
        }]);
        setSuccess(`Successfully uploaded ${file.name}`);
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
      'text/plain': ['.txt'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 10 * 1024 * 1024
  });

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/notes/${noteId}`);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      setSuccess('Note deleted successfully');
    } catch (error) {
      setError('Failed to delete note');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'txt': return '📃';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📄';
    }
  };

  const getFileColor = (fileName) => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch(ext) {
      case 'pdf': return 'from-red-500 to-red-600';
      case 'docx': return 'from-blue-500 to-blue-600';
      case 'txt': return 'from-gray-500 to-gray-600';
      case 'jpg':
      case 'jpeg':
      case 'png': return 'from-purple-500 to-purple-600';
      default: return 'from-green-500 to-emerald-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="glass-effect shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 text-slate-600 hover:text-slate-800 hover:bg-white/50 rounded-xl transition-all duration-200">
                <ArrowLeft size={20} />
              </Link>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Upload Notes
                </h1>
                <p className="text-sm text-slate-500 font-medium">Upload and organize your study notes</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/70 rounded-xl px-4 py-2">
                <span className="text-sm font-medium text-slate-700">{notes.length} notes</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border border-green-200 text-green-700 rounded-2xl shadow-sm animate-slideIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <p className="font-medium">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl shadow-sm animate-slideIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
                <X size={20} />
              </button>
            </div>
          </div>
        )}
          
        {/* Upload Area */}
        <div className="card mb-8 animate-slideIn">
          <div 
            {...getRootProps()} 
            className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all duration-300 group ${
              uploading ? 'opacity-50 pointer-events-none' : ''
            } ${
              isDragActive ? 'border-blue-400 bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                isDragActive ? 'bg-blue-500 scale-110' : 'bg-slate-100 group-hover:bg-blue-100'
              }`}>
                <Upload className={`w-8 h-8 transition-colors duration-300 ${
                  isDragActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                }`} />
              </div>
              
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-lg font-bold text-blue-600 mb-1">Uploading...</p>
                  <p className="text-slate-600 text-sm">Processing your notes</p>
                </div>
              ) : isDragActive ? (
                <div>
                  <p className="text-lg font-bold text-blue-600 mb-1">Drop files here!</p>
                  <p className="text-slate-600 text-sm">Release to upload your notes</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-slate-800 mb-2">
                    Drag & drop notes or click to browse
                  </p>
                  <p className="text-sm text-slate-500">
                    PDF, DOCX, TXT, JPG, PNG • Max 10MB per file
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="animate-slideIn" style={{animationDelay: '0.2s'}}>
          {notes.length === 0 ? (
            <div className="card">
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  No notes uploaded yet
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Upload your first note to start building your organized study collection
                </p>
                <button className="btn-primary inline-flex items-center space-x-2" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <Plus size={18} />
                  <span>Upload First Note</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note, index) => (
                <div key={note.id} className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${getFileColor(note.fileName)} rounded-xl flex items-center justify-center text-2xl`}>
                        {getFileIcon(note.fileName)}
                      </div>
                      <button 
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2 truncate" title={note.name}>
                      {note.name}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2 truncate" title={note.fileName}>
                      File: {note.fileName}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{formatFileSize(note.size)}</span>
                      <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Uploaded</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        Uploaded {note.uploadDate ? new Date(note.uploadDate).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadNotes;
