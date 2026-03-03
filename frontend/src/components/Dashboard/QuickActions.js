import React from 'react';

const QuickActions = () => {
  const quizOptions = [
    { icon: '⚡', text: 'Quick Quiz', subtitle: '5 questions' },
    { icon: '📚', text: 'Subject Quiz', subtitle: 'Choose subject' },
    { icon: '📝', text: 'Previous Year', subtitle: 'Past papers' },
    { icon: '🎴', text: 'Flashcards', subtitle: 'Quick review' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Practice Mode */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-lg p-6 text-white">
        <h3 className="text-2xl font-bold mb-4">Practice With AI</h3>
        <div className="space-y-3">
          {quizOptions.map((opt, idx) => (
            <button
              key={idx}
              className="w-full flex items-center gap-4 p-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all backdrop-blur-sm"
            >
              <span className="text-3xl">{opt.icon}</span>
              <div className="text-left">
                <p className="font-semibold">{opt.text}</p>
                <p className="text-sm opacity-90">{opt.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Study Planner */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">AI Study Planner</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Date</label>
            <input type="date" className="w-full p-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Study Hours/Day</label>
            <input type="number" placeholder="4" className="w-full p-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <input type="text" placeholder="DBMS, OS, CN" className="w-full p-3 border border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none" />
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Generate Study Plan
          </button>
        </div>
      </div>

      {/* Code Explainer */}
      <div className="md:col-span-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg p-6 border border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Explain Code</h3>
        <textarea
          placeholder="Paste your code here and AI will explain it..."
          className="w-full p-4 border-2 border-green-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
          rows="4"
        />
        <button className="mt-3 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all">
          Explain This Code
        </button>
      </div>

    </div>
  );
};

export default QuickActions;
