import React from 'react';

const StudyRecommendations = () => {
  const recommendations = [
    {
      icon: '📄',
      title: 'You uploaded DBMS yesterday',
      action: 'Generate Summary',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '⚠️',
      title: "You didn't study CN in 4 days",
      action: 'Quick Quiz',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🎯',
      title: 'Upcoming exam in 15 days',
      action: 'Start 15 min revision',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Today's Study Suggestions</h3>
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-indigo-50 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${rec.color} rounded-xl flex items-center justify-center text-2xl`}>
                {rec.icon}
              </div>
              <p className="font-medium text-gray-700">{rec.title}</p>
            </div>
            <button className="px-5 py-2 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-600 hover:text-white transition-all">
              {rec.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyRecommendations;
