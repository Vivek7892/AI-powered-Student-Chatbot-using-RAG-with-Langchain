import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminImportantNotes = () => {
  const [formData, setFormData] = useState({ priority: 'medium' });
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/important-notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message || !formData.semester) {
      alert('Please fill in all required fields including semester');
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    const formDataObj = new FormData();
    
    Object.keys(formData).forEach(key => {
      formDataObj.append(key, formData[key]);
    });
    
    if (file) formDataObj.append('file', file);

    try {
      const url = editingId ? `http://localhost:5001/api/admin/important-notes/${editingId}` : 'http://localhost:5001/api/admin/important-notes';
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataObj
      });
      
      if (response.ok) {
        alert(editingId ? 'Note updated successfully!' : 'Important note sent successfully!');
        setFormData({ priority: 'medium' });
        setFile(null);
        setEditingId(null);
        fetchNotes();
      } else {
        alert('Error occurred');
      }
    } catch (error) {
      alert('Error occurred');
    }
  };

  const handleEdit = (note) => {
    setFormData({ title: note.title, message: note.message, semester: note.semester, priority: note.priority });
    setEditingId(note._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/important-notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Note deleted successfully!');
        fetchNotes();
      } else {
        alert('Error occurred');
      }
    } catch (error) {
      alert('Error occurred');
    }
  };

  const resetForm = () => {
    setFormData({ priority: 'medium' });
    setFile(null);
    setEditingId(null);
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <h1>Send Important Note</h1>
            <p>Send important notifications to all students</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="admin-dashboard-logout">
            Back to Dashboard
          </button>
        </div>

        <div className="admin-dashboard-form">
          <div className="admin-dashboard-field">
            <label>Title</label>
            <input
              type="text"
              placeholder="Enter notification title"
              className="admin-dashboard-input"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="admin-dashboard-field">
            <label>Message</label>
            <textarea
              placeholder="Enter important message"
              className="admin-dashboard-textarea"
              value={formData.message || ''}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <div className="admin-dashboard-field">
            <label>Semester</label>
            <select
              className="admin-dashboard-input"
              value={formData.semester || ''}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              required
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>
          <div className="admin-dashboard-field">
            <label>File (Optional)</label>
            <input
              type="file"
              className="admin-dashboard-file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <div className="admin-dashboard-field">
            <label>Priority Level</label>
            <select
              className="admin-dashboard-select"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              value={formData.priority}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
          <div className="admin-dashboard-modal-actions">
            <button
              onClick={handleSubmit}
              className="admin-dashboard-btn admin-dashboard-btn--primary"
            >
              {editingId ? 'Update Note' : 'Send Notification'}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="admin-dashboard-btn admin-dashboard-btn--secondary"
              >
                Cancel Edit
              </button>
            )}
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="admin-dashboard-btn admin-dashboard-btn--secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="admin-dashboard-table">
          <h3>Important Notes</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Message</th>
                <th>Semester</th>
                <th>File</th>
                <th>Priority</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {notes.map(note => (
                <tr key={note._id}>
                  <td>{note.title}</td>
                  <td>{note.message?.substring(0, 50)}...</td>
                  <td>{note.semester || 'Not Set'}</td>
                  <td>{note.fileName || 'No file'}</td>
                  <td><span className={`priority-${note.priority}`}>{note.priority}</span></td>
                  <td>{new Date(note.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(note)} className="admin-table-btn edit">Edit</button>
                    <button onClick={() => handleDelete(note._id)} className="admin-table-btn delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminImportantNotes;
