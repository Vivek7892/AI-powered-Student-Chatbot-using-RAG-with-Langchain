import React, { useState } from 'react';

const AIChat = () => {
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('Explain DBMS normalization');

  const placeholders = [
    'Explain DBMS normalization',
    'Create 5 mark answer for Operating System scheduling',
    'Summarize my uploaded PDF',
    'Generate quiz from Computer Networks'
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const suggestions = [
    { icon: '📝', text: 'Summarize Notes' },
    { icon: '🎯', text: 'Generate Quiz' },
    { icon: '💬', text: 'Viva Questions' },
    { icon: '⭐', text: 'Important Questions' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Your AI Tutor</h2>
          <p className="text-gray-500 text-sm">Ask me anything about your studies</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          className="w-full p-6 pr-32 border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:outline-none resize-none transition-all text-lg"
          rows="4"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-all">
            📎
          </button>
          <button className="p-3 hover:bg-gray-100 rounded-xl transition-all">
            🎤
          </button>
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Send →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        {suggestions.map((sug, idx) => (
          <button
            key={idx}
            className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-medium transition-all hover:scale-105"
          >
            <span className="mr-2">{sug.icon}</span>
            {sug.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AIChat;
