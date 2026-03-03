import React from 'react';

const ProgressTracker = () => {
  const stats = [
    { label: 'Topics Learned', value: '12', icon: '📚', color: 'bg-blue-100 text-blue-600' },
    { label: 'Study Streak', value: '7 days', icon: '🔥', color: 'bg-orange-100 text-orange-600' },
    { label: 'Quiz Accuracy', value: '85%', icon: '🎯', color: 'bg-green-100 text-green-600' },
    { label: 'Time Studied', value: '24h', icon: '⏱️', color: 'bg-purple-100 text-purple-600' }
  ];

  const subjects = [
    { name: 'DBMS', progress: 75, color: 'bg-blue-500' },
    { name: 'Operating System', progress: 60, color: 'bg-green-500' },
    { name: 'Computer Networks', progress: 45, color: 'bg-purple-500' },
    { name: 'Machine Learning', progress: 30, color: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Progress Stats */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Progress</h3>
        <div className="space-y-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Subject Progress</h3>
        <div className="space-y-4">
          {subjects.map((sub, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                <span className="text-sm font-bold text-gray-800">{sub.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${sub.color} h-3 rounded-full transition-all duration-500`}
                  style={{ width: `${sub.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Weekly Activity</h3>
        <div className="flex justify-between items-end h-32">
          {[40, 65, 45, 80, 55, 70, 90].map((height, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div
                className="w-8 bg-white/30 rounded-t-lg hover:bg-white/50 transition-all cursor-pointer"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs opacity-75">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProgressTracker;
