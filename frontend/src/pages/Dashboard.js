import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, FileText, Brain, Calendar, LogOut, TrendingUp, Clock, BookOpen, Award, Settings, Bell, Search, BarChart3, Users, Zap, Upload, FolderOpen } from 'lucide-react';
import { userService } from '../services/userService';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }
      
      // Load personalized dashboard with semester content
      const dashboardResponse = await axios.get('http://localhost:5001/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(dashboardResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setLoading(false);
    }
  };

  const handleChatClick = async () => {
    await updateDashboardActivity('chat', 'Started AI Chat Session', 'Began conversation with AI assistant');
    navigate('/chat', { state: { messageType: 'chat' } });
  };

  const handleQuizClick = async () => {
    await updateDashboardActivity('quiz', 'Generated AI Quiz', 'Created practice quiz from study materials');
    navigate('/chat', { state: { messageType: 'quiz' } });
  };

  const handleStudyPlanClick = async () => {
    await updateDashboardActivity('plan', 'Created Study Plan', 'Generated personalized learning schedule');
    navigate('/chat', { state: { messageType: 'study-plan' } });
  };

  const updateDashboardActivity = async (type, title, description) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.post('http://localhost:5001/api/dashboard/activity', 
        { type, title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Reload dashboard data to show updated activity
      loadDashboardData();
    } catch (error) {
      console.error('Failed to update dashboard activity:', error);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__inner">
          <div className="dashboard-brand">
            <div className="dashboard-brand__icon">
              <Zap size={24} />
            </div>
            <div className="dashboard-brand__text">
              <h1>AI Student Assistant</h1>
              <p>Professional Learning Dashboard</p>
            </div>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-actions__button" aria-label="Open search">
              <Search size={18} />
            </button>
            <button className="dashboard-actions__button" aria-label="View notifications">
              <div className="dashboard-actions__badge"></div>
              <Bell size={18} />
            </button>
            <button className="dashboard-actions__button" aria-label="Open settings">
              <Settings size={18} />
            </button>

            <div className="dashboard-profile">
              <div className="dashboard-profile__text">
                <span>{user?.email || 'student@example.com'}</span>
                <span>Semester {user?.semester || 'Not Set'}</span>
              </div>
              <div className="dashboard-profile__avatar">
                {(user?.email || 'S')[0].toUpperCase()}
              </div>
              <button onClick={logout} className="dashboard-logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-container">
        {/* Welcome Section */}
        <section className="dashboard-welcome">
          <div className="dashboard-welcome__content">
            <h2>{dashboardData?.personalizedContent?.welcomeMessage || 'Good morning! 👋'}</h2>
            <p>Ready to continue your learning journey?</p>
            {dashboardData?.personalizedContent?.learningGoals?.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Your Goals:</strong>
                <ul style={{ margin: '0.25rem 0', paddingLeft: '1rem' }}>
                  {dashboardData.personalizedContent.learningGoals.slice(0, 2).map((goal, index) => (
                    <li key={index} style={{ fontSize: '0.9rem', color: '#64748b' }}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="dashboard-date">
            <span>Today</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </section>

        {/* Statistics Cards */}
        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--documents">
              <FileText size={20} />
            </div>
            <span>Total Documents</span>
            <strong>{dashboardData?.stats?.documentsUploaded || 0}</strong>
            <span>uploaded</span>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--chat">
              <MessageCircle size={20} />
            </div>
            <span>Chat Sessions</span>
            <strong>{dashboardData?.stats?.chatSessions || 0}</strong>
            <span>conversations</span>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--quiz">
              <Brain size={20} />
            </div>
            <span>Quizzes Completed</span>
            <strong>{dashboardData?.stats?.quizzesCompleted || 0}</strong>
            <span>practice tests</span>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-card__icon dashboard-stat-card__icon--plan">
              <Calendar size={20} />
            </div>
            <span>Study Plans</span>
            <strong>{dashboardData?.stats?.studyPlansCreated || 0}</strong>
            <span>created</span>
          </article>
        </section>
        
        {/* Main Content Grid */}
        <section className="dashboard-grid">
          {/* Quick Actions */}
          <div className="dashboard-grid__primary">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <h3>Quick Actions</h3>
                <Link to="/chat">View all →</Link>
              </div>

              <div className="dashboard-quick-actions">
                <button onClick={handleChatClick} className="dashboard-quick-actions__card">
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                    <MessageCircle size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>AI Chat Assistant</h4>
                    <p>Start intelligent conversations about your study materials</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">Most Popular</span>
                      <span>Start chatting →</span>
                    </div>
                  </div>
                </button>

                <Link to="/documents" className="dashboard-quick-actions__card" style={{ animationDelay: '0.1s' }}>
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #22c55e, #0d9488)' }}>
                    <FileText size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>Document Manager</h4>
                    <p>Upload and organize your study materials</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">Essential</span>
                      <span>Manage files →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/quiz-generator" className="dashboard-quick-actions__card" style={{ animationDelay: '0.2s' }}>
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
                    <Brain size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>AI Quiz Generator</h4>
                    <p>Create personalized quizzes from your documents</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">AI Powered</span>
                      <span>Generate quiz →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/study-planner" className="dashboard-quick-actions__card" style={{ animationDelay: '0.3s' }}>
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                    <Calendar size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>Study Planner</h4>
                    <p>Create personalized learning schedules</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">Personalized</span>
                      <span>Create plan →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/upload-notes" className="dashboard-quick-actions__card" style={{ animationDelay: '0.4s' }}>
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                    <Upload size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>Upload Notes</h4>
                    <p>Upload and organize your study notes</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">Organize</span>
                      <span>Upload notes →</span>
                    </div>
                  </div>
                </Link>

                <Link to="/files" className="dashboard-quick-actions__card" style={{ animationDelay: '0.5s' }}>
                  <div className="dashboard-quick-actions__icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                    <FolderOpen size={20} />
                  </div>
                  <div className="dashboard-quick-actions__content">
                    <h4>Study Files</h4>
                    <p>Access all admin-uploaded study materials</p>
                    <div className="dashboard-quick-actions__meta">
                      <span className="dashboard-quick-actions__badge">Resources</span>
                      <span>Browse files →</span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Sidebar */}
          <aside className="dashboard-grid__secondary">
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <h3>Recent Activity</h3>
                <button type="button">View all →</button>
              </div>
              <div className="dashboard-activity">
                {dashboardData?.recentActivity?.length > 0 ? (
                  dashboardData.recentActivity.map((activity, index) => {
                    const IconComponent = activity.type === 'chat' ? MessageCircle
                      : activity.type === 'quiz' ? Brain
                      : activity.type === 'document' ? FileText
                      : Calendar;
                    
                    const colorClass = activity.type === 'chat'
                      ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.32))'
                      : activity.type === 'quiz'
                      ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.32))'
                      : activity.type === 'document'
                      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.32))'
                      : 'linear-gradient(135deg, rgba(251, 146, 60, 0.15), rgba(251, 146, 60, 0.32))';

                    return (
                      <div key={index} className="dashboard-activity__item">
                        <div className="dashboard-activity__icon" style={{ background: colorClass }}>
                          <IconComponent size={16} />
                        </div>
                        <div className="dashboard-activity__text">
                          <strong>{activity.title}</strong>
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    <p>No recent activity yet.</p>
                    <p style={{ fontSize: '0.9rem' }}>Start using the AI assistant to see your activity here!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Card */}
            <div className="dashboard-card">
              <div className="dashboard-card__header">
                <h3>Achievements</h3>
                <Award size={18} />
              </div>
              <div className="dashboard-progress">
                {dashboardData?.personalizedContent?.achievements?.length > 0 ? (
                  dashboardData.personalizedContent.achievements.slice(0, 3).map((achievement, index) => (
                    <div key={index} style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{achievement.icon}</span>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{achievement.title}</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b' }}>
                    <p>Start your learning journey to earn achievements!</p>
                  </div>
                )}
                <div className="dashboard-progress__stat">
                  <span>Study Streak</span>
                  <span className="dashboard-progress__streak">🔥 <span>{dashboardData?.personalizedContent?.studyStreak || 0} days</span></span>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Admin Content Section */}
        <section className="dashboard-grid" style={{ marginTop: '2rem' }}>
          <div className="dashboard-card" style={{ gridColumn: '1 / -1' }}>
            <div className="dashboard-card__header">
              <h3>Your Semester Content ({user?.semester || 'Not Set'})</h3>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Personalized for your semester</span>
            </div>
            
            {/* Important Notes */}
            {dashboardData?.semesterContent?.importantNotes?.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>📢 Important Announcements</h4>
                {dashboardData.semesterContent.importantNotes.slice(0, 3).map(note => (
                  <div key={note._id} style={{ 
                    padding: '0.75rem', 
                    backgroundColor: note.priority === 'high' ? '#fef2f2' : '#f8fafc', 
                    border: `1px solid ${note.priority === 'high' ? '#fecaca' : '#e2e8f0'}`,
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <strong>{note.title}</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{note.message}</p>
                    <small style={{ color: '#64748b' }}>{new Date(note.createdAt).toLocaleDateString()}</small>
                  </div>
                ))}
              </div>
            )}

            {!dashboardData?.semesterContent?.notes?.length && 
             !dashboardData?.semesterContent?.timetables?.length && 
             !dashboardData?.semesterContent?.mcqTests?.length && 
             !dashboardData?.semesterContent?.importantNotes?.length ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                <p>No content available for your semester yet.</p>
                <p style={{ fontSize: '0.9rem' }}>Your admin will upload semester-specific materials soon!</p>
              </div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {/* Study Notes */}
              {dashboardData?.semesterContent?.notes?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>📚 Study Notes</h4>
                  {dashboardData.semesterContent.notes.slice(0, 3).map(note => (
                    <div key={note._id} style={{ padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong>{note.title}</strong>
                      {note.semester && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '0.5rem' }}>Semester {note.semester}</span>}
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{note.content.substring(0, 100)}...</p>
                      {note.fileName && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <a href={`http://localhost:5001/uploads/admin/${note.fileName}`} target="_blank" rel="noopener noreferrer" 
                             style={{ color: '#3b82f6', fontSize: '0.8rem', textDecoration: 'none' }}>📎 {note.fileName}</a>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `http://localhost:5001/api/admin/download/note/${note._id}`;
                              link.download = note.fileName;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            style={{
                              background: '#22c55e',
                              color: 'white',
                              border: 'none',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontSize: '0.7rem',
                              cursor: 'pointer'
                            }}
                          >
                            ⬇️ Download
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Timetables */}
              {dashboardData?.semesterContent?.timetables?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>📅 Timetables</h4>
                  {dashboardData.semesterContent.timetables.slice(0, 2).map(timetable => (
                    <div key={timetable._id} style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong>{timetable.title}</strong>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{timetable.description}</p>
                      {timetable.imagePath && (
                        <img src={`http://localhost:5001/${timetable.imagePath}`} alt={timetable.title} 
                             style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', marginTop: '0.5rem', borderRadius: '0.25rem' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* MCQ Tests */}
              {dashboardData?.semesterContent?.mcqTests?.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>🧠 Available Tests</h4>
                  {dashboardData.semesterContent.mcqTests.slice(0, 3).map(test => (
                    <Link 
                      key={test._id} 
                      to={`/test/${test._id}`}
                      style={{ 
                        display: 'block',
                        padding: '0.75rem', 
                        backgroundColor: '#faf5ff', 
                        borderRadius: '0.5rem', 
                        marginBottom: '0.5rem',
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f3e8ff';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#faf5ff';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <strong>{test.title}</strong>
                      <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>{test.description}</p>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {test.questions?.length || 0} questions • {test.timeLimit} minutes
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        </section>

        {/* Call to Action */}
        <section className="dashboard-cta">
          <div className="dashboard-cta__left">
            <div className="dashboard-cta__icon">
              <TrendingUp size={32} color="#fff" />
            </div>
            <div className="dashboard-cta__text">
              <h4>Boost Your Learning</h4>
              <p>
                Upload your study materials and let our AI assistant help you learn more effectively with intelligent conversations, quizzes, and personalized study plans.
              </p>
            </div>
          </div>
          <div className="dashboard-cta__actions">
            <Link to="/documents" className="dashboard-cta__primary">
              <FileText size={18} />
              <span>Upload Documents</span>
            </Link>
            <Link to="/chat" className="dashboard-cta__secondary">
              <MessageCircle size={18} />
              <span>Start Chatting</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
