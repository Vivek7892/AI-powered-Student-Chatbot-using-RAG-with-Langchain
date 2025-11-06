import React from 'react';
import { Link } from 'react-router-dom';

const FilesSimple = () => {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: '#f1f5f9' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block' }}>
          ← Back to Dashboard
        </Link>
        
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1f2937' }}>
          📁 Study Files
        </h1>
        
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Access admin-uploaded study materials and resources
        </p>
        
        <div style={{ 
          background: 'white', 
          padding: '2rem', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
        }}>
          <h2 style={{ color: '#1f2937', marginBottom: '1rem' }}>Files Feature</h2>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            This is a simplified version of the Files page to test functionality.
            The full Files page with admin content will load here once the backend connection is established.
          </p>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
            <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Available Features:</h3>
            <ul style={{ color: '#6b7280' }}>
              <li>View admin-uploaded study notes</li>
              <li>Download important announcements</li>
              <li>Access timetables and schedules</li>
              <li>Browse MCQ tests and quizzes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesSimple;
