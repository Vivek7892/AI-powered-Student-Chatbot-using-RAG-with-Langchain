import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [files, setFiles] = useState({ notes: [], importantNotes: [], timetables: [] });
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalNotes: 0,
    mcqTests: 0,
    notifications: 0
  });

  useEffect(() => {
    const data = localStorage.getItem('adminData');
    if (data) setAdminData(JSON.parse(data));
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchFiles();
    fetchStats();
    return () => clearInterval(timer);
  }, []);

  const fetchFiles = async () => {
    try {
      const [notesRes, importantRes, timetablesRes] = await Promise.all([
        fetch('http://localhost:5001/api/admin/notes'),
        fetch('http://localhost:5001/api/admin/important-notes'),
        fetch('http://localhost:5001/api/admin/timetables')
      ]);
      
      setFiles({
        notes: await notesRes.json(),
        importantNotes: await importantRes.json(),
        timetables: await timetablesRes.json()
      });
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const downloadFile = (type, id, filename) => {
    const url = `http://localhost:5001/api/admin/download/${type}/${id}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin');
  };

  const cards = [
    {
      title: 'Upload Notes',
      description: 'Upload study materials and notes',
      icon: '📚',
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/admin/notes')
    },
    {
      title: 'Timetable',
      description: 'Create or upload timetable images',
      icon: '📅',
      color: 'from-green-500 to-green-600',
      action: () => navigate('/admin/timetable')
    },
    {
      title: 'Important Notes',
      description: 'Send important notifications to students',
      icon: '⚠️',
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/admin/important-notes')
    },
    {
      title: 'MCQ Tests',
      description: 'Create and manage MCQ tests',
      icon: '📝',
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/admin/mcq')
    }
  ];

  const statsDisplay = [
    { label: 'Active Students', value: stats.activeStudents.toLocaleString() },
    { label: 'Total Notes', value: stats.totalNotes.toLocaleString() },
    { label: 'MCQ Tests', value: stats.mcqTests.toLocaleString() },
    { label: 'Notifications', value: stats.notifications.toLocaleString() }
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <div className="admin-welcome">
              <h1>Welcome back, {adminData?.name || 'Admin'} 👋</h1>
              <p>{currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <div className="admin-time">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
          </div>
          <button onClick={handleLogout} className="admin-dashboard-logout">
            <span>🚪</span>
            Logout
          </button>
        </div>

        <div className="admin-stats-grid">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="admin-stat-card">
              <div className="admin-stat-value">{stat.value}</div>
              <div className="admin-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="admin-dashboard-grid">
          {cards.map((card, index) => (
            <div key={index} className="admin-dashboard-card" onClick={card.action}>
              <div className={`admin-card-icon bg-gradient-to-r ${card.color}`}>
                {card.icon}
              </div>
              <div className="admin-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="admin-card-arrow">→</div>
            </div>
          ))}
        </div>

        <div className="admin-files-section">
          <h2>📁 Uploaded Files</h2>
          
          <div className="files-grid">
            <div className="file-category">
              <h3>📚 Notes ({files.notes.length})</h3>
              {files.notes.map(note => (
                <div key={note._id} className="file-item">
                  <span>{note.title}</span>
                  {note.fileName && (
                    <button onClick={() => downloadFile('note', note._id, note.fileName)}>⬇️</button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="file-category">
              <h3>⚠️ Important Notes ({files.importantNotes.length})</h3>
              {files.importantNotes.map(note => (
                <div key={note._id} className="file-item">
                  <span>{note.title}</span>
                  {note.fileName && (
                    <button onClick={() => downloadFile('important', note._id, note.fileName)}>⬇️</button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="file-category">
              <h3>📅 Timetables ({files.timetables.length})</h3>
              {files.timetables.map(timetable => (
                <div key={timetable._id} className="file-item">
                  <span>{timetable.title}</span>
                  {timetable.imagePath && (
                    <button onClick={() => downloadFile('timetable', timetable._id, 'timetable.jpg')}>⬇️</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
