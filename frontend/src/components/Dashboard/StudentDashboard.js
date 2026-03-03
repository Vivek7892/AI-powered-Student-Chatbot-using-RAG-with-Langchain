import React, { useState, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import AIChat from './AIChat';
import StudyMaterials from './StudyMaterials';
import QuickActions from './QuickActions';
import StudyRecommendations from './StudyRecommendations';
import ProgressTracker from './ProgressTracker';

const StudentDashboard = () => {
  const [user] = useState({ name: 'Student', semester: '6th', subjects: 5 });
  const [greeting, setGreeting] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex">
        <ChatHistory isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto px-6 py-8">
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {greeting}, {user.name} 👋
                  </h1>
                  <div className="flex items-center gap-4 mt-3 text-gray-600">
                    <span>📚 Semester {user.semester}</span>
                    <span>•</span>
                    <span>{user.subjects} Subjects</span>
                    <span>•</span>
                    <span className="text-orange-600">⏰ Next Exam: 15 days</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all">
                  Start Quick Revision
                </button>
              </div>
            </div>

            <AIChat />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2 space-y-6">
                <StudyRecommendations />
                <StudyMaterials />
                <QuickActions />
              </div>
              <div className="space-y-6">
                <ProgressTracker />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
