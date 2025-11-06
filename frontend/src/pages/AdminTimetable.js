import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminTimetable = () => {
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [createMode, setCreateMode] = useState('upload'); // 'upload' or 'create'
  const [timetableData, setTimetableData] = useState({
    title: '',
    description: '',
    semester: '',
    schedule: Array(7).fill().map(() => Array(8).fill(''))
  });
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const navigate = useNavigate();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00', '4:00-5:00'];

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/timetables');
      const data = await response.json();
      setTimetables(data);
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const handleSubmit = async () => {
    if (createMode === 'create') {
      if (!timetableData.title || !timetableData.description || !timetableData.semester) {
        alert('Please fill in all required fields including semester');
        return;
      }
    } else {
      if (!formData.title || !formData.description || !formData.semester) {
        alert('Please fill in all required fields including semester');
        return;
      }
    }
    
    const token = localStorage.getItem('adminToken');
    
    if (createMode === 'create') {
      try {
        const response = await fetch('http://localhost:5001/api/admin/timetable/create', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(timetableData)
        });
        
        if (response.ok) {
          alert('Timetable created successfully!');
          setTimetableData({ title: '', description: '', semester: '', schedule: Array(7).fill().map(() => Array(8).fill('')) });
          fetchTimetables();
        } else {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          alert(`Error: ${errorData.error || 'Unknown error occurred'}`);
        }
      } catch (error) {
        console.error('Network error:', error);
        alert(`Network error: ${error.message}`);
      }
    } else {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });
      if (file) formDataObj.append('image', file);

      try {
        const url = editingId ? `http://localhost:5001/api/admin/timetable/${editingId}` : 'http://localhost:5001/api/admin/timetable';
        const method = editingId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataObj
        });
        
        if (response.ok) {
          alert(editingId ? 'Timetable updated successfully!' : 'Timetable uploaded successfully!');
          setFormData({});
          setFile(null);
          setEditingId(null);
          fetchTimetables();
        } else {
          alert('Error occurred');
        }
      } catch (error) {
        alert('Error occurred');
      }
    }
  };

  const handleEdit = (timetable) => {
    setFormData({ title: timetable.title, description: timetable.description, semester: timetable.semester });
    setEditingId(timetable._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/timetable/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Timetable deleted successfully!');
        fetchTimetables();
      } else {
        alert('Error occurred');
      }
    } catch (error) {
      alert('Error occurred');
    }
  };

  const resetForm = () => {
    setFormData({});
    setFile(null);
    setEditingId(null);
    setTimetableData({ title: '', description: '', semester: '', schedule: Array(7).fill().map(() => Array(8).fill('')) });
  };

  const updateSchedule = (dayIndex, timeIndex, value) => {
    const newSchedule = [...timetableData.schedule];
    newSchedule[dayIndex][timeIndex] = value;
    setTimetableData({ ...timetableData, schedule: newSchedule });
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <h1>Upload Timetable</h1>
            <p>Create or upload timetable images for students</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="admin-dashboard-logout">
            Back to Dashboard
          </button>
        </div>

        <div className="admin-dashboard-form">
          <div className="admin-dashboard-field">
            <label>Mode</label>
            <select 
              className="admin-dashboard-input"
              value={createMode}
              onChange={(e) => setCreateMode(e.target.value)}
            >
              <option value="upload">Upload Image</option>
              <option value="create">Create Timetable</option>
            </select>
          </div>

          {createMode === 'upload' ? (
            <>
              <div className="admin-dashboard-field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Enter timetable title"
                  className="admin-dashboard-input"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="admin-dashboard-field">
                <label>Description</label>
                <textarea
                  placeholder="Enter timetable description"
                  className="admin-dashboard-textarea"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <label>Timetable Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="admin-dashboard-file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </>
          ) : (
            <>
              <div className="admin-dashboard-field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Enter timetable title"
                  className="admin-dashboard-input"
                  value={timetableData.title}
                  onChange={(e) => setTimetableData({ ...timetableData, title: e.target.value })}
                />
              </div>
              <div className="admin-dashboard-field">
                <label>Description</label>
                <textarea
                  placeholder="Enter timetable description"
                  className="admin-dashboard-textarea"
                  value={timetableData.description}
                  onChange={(e) => setTimetableData({ ...timetableData, description: e.target.value })}
                />
              </div>
              <div className="admin-dashboard-field">
                <label>Semester</label>
                <select
                  className="admin-dashboard-input"
                  value={timetableData.semester || ''}
                  onChange={(e) => setTimetableData({ ...timetableData, semester: e.target.value })}
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

              <div className="timetable-builder">
                <h3>Create Timetable</h3>
                <div className="timetable-grid">
                  <div className="time-header">Time</div>
                  {days.map(day => (
                    <div key={day} className="day-header">{day}</div>
                  ))}
                  {timeSlots.map((time, timeIndex) => (
                    <React.Fragment key={time}>
                      <div className="time-slot">{time}</div>
                      {days.map((day, dayIndex) => (
                        <input
                          key={`${day}-${time}`}
                          type="text"
                          className="schedule-input"
                          placeholder="Subject"
                          value={timetableData.schedule[dayIndex][timeIndex]}
                          onChange={(e) => updateSchedule(dayIndex, timeIndex, e.target.value)}
                        />
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="admin-dashboard-modal-actions">
            <button
              onClick={handleSubmit}
              className="admin-dashboard-btn admin-dashboard-btn--primary"
            >
              {createMode === 'create' ? 'Create Timetable' : (editingId ? 'Update Timetable' : 'Upload Timetable')}
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
          <h3>Uploaded Timetables</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Semester</th>
                <th>Type</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {timetables.map(timetable => (
                <tr key={timetable._id}>
                  <td>{timetable.title}</td>
                  <td>{timetable.description?.substring(0, 50)}...</td>
                  <td>{timetable.semester || 'Not Set'}</td>
                  <td>{timetable.schedule ? 'Custom' : 'Image'}</td>
                  <td>{new Date(timetable.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(timetable)} className="admin-table-btn edit">Edit</button>
                    <button onClick={() => handleDelete(timetable._id)} className="admin-table-btn delete">Delete</button>
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

export default AdminTimetable;
