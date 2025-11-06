import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminMCQ = () => {
  const [formData, setFormData] = useState({});
  const [questions, setQuestions] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  const [tests, setTests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/mcq-tests');
      const data = await response.json();
      setTests(data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.semester) {
      alert('Please fill in all required fields including semester');
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login as admin first');
      return;
    }
    
    const payload = {
      ...formData,
      questions
    };

    try {
      const url = editingId ? `http://localhost:5001/api/admin/mcq-tests/${editingId}` : 'http://localhost:5001/api/admin/mcq-tests';
      const method = editingId ? 'PUT' : 'POST';
      
      console.log('Submitting MCQ:', payload);
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseData = await response.json();
      console.log('Response:', response.status, responseData);
      
      if (response.ok) {
        alert(editingId ? 'Test updated successfully!' : 'MCQ test created successfully!');
        setFormData({});
        setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
        setEditingId(null);
        fetchTests();
      } else {
        alert(`Error: ${responseData.error || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (test) => {
    setFormData({ title: test.title, description: test.description, semester: test.semester, timeLimit: test.timeLimit });
    setQuestions(test.questions || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setEditingId(test._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`http://localhost:5001/api/admin/mcq-tests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        alert('Test deleted successfully!');
        fetchTests();
      } else {
        alert('Error occurred');
      }
    } catch (error) {
      alert('Error occurred');
    }
  };

  const resetForm = () => {
    setFormData({});
    setQuestions([{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    setEditingId(null);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    if (field === 'options') {
      updated[index].options = value;
    } else {
      updated[index][field] = value;
    }
    setQuestions(updated);
  };

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            <h1>Create MCQ Test</h1>
            <p>Create and manage multiple choice question tests</p>
          </div>
          <button onClick={() => navigate('/admin/dashboard')} className="admin-dashboard-logout">
            Back to Dashboard
          </button>
        </div>

        <div className="admin-dashboard-form">
          <div className="admin-dashboard-field">
            <label>Test Title</label>
            <input
              type="text"
              placeholder="Enter test title"
              className="admin-dashboard-input"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="admin-dashboard-field">
            <label>Description</label>
            <textarea
              placeholder="Enter test description"
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
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              placeholder="Enter time limit"
              className="admin-dashboard-input"
              value={formData.timeLimit || ''}
              onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
            />
          </div>
          
          <div className="admin-dashboard-question-list">
            <h3>Questions</h3>
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="admin-dashboard-question">
                <input
                  type="text"
                  placeholder={`Question ${qIndex + 1}`}
                  className="admin-dashboard-input"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                />
                {q.options.map((option, oIndex) => (
                  <div key={oIndex} className="admin-dashboard-option">
                    <input
                      type="radio"
                      name={`correct-${qIndex}`}
                      checked={q.correctAnswer === oIndex}
                      onChange={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                    />
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      className="admin-dashboard-input"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...q.options];
                        newOptions[oIndex] = e.target.value;
                        updateQuestion(qIndex, 'options', newOptions);
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <button onClick={addQuestion} className="admin-dashboard-add-question">
            Add Question
          </button>
          
          <div className="admin-dashboard-modal-actions">
            <button
              onClick={handleSubmit}
              className="admin-dashboard-btn admin-dashboard-btn--primary"
            >
              {editingId ? 'Update Test' : 'Create Test'}
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
          <h3>MCQ Tests</h3>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Semester</th>
                <th>Questions</th>
                <th>Time Limit</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => (
                <tr key={test._id}>
                  <td>{test.title}</td>
                  <td>{test.description?.substring(0, 30)}...</td>
                  <td>{test.semester || 'Not Set'}</td>
                  <td>{test.questions?.length || 0}</td>
                  <td>{test.timeLimit} min</td>
                  <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => handleEdit(test)} className="admin-table-btn edit">Edit</button>
                    <button onClick={() => handleDelete(test._id)} className="admin-table-btn delete">Delete</button>
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

export default AdminMCQ;
