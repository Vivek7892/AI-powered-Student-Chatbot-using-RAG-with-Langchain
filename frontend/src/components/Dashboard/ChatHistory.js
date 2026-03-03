import React from 'react';

const ChatHistory = ({ isOpen, onToggle }) => {
  const conversations = [
    { id: 1, title: 'DBMS Normalization', time: '2 hours ago' },
    { id: 2, title: 'OS Deadlock', time: 'Yesterday' },
    { id: 3, title: 'Python Sorting', time: '2 days ago' },
    { id: 4, title: 'Machine Learning Notes', time: '3 days ago' },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6 mt-12">
            <h2 className="text-xl font-bold text-gray-800">Chat History</h2>
            <button className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
              + New
            </button>
          </div>

          <div className="space-y-2">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className="p-4 rounded-xl hover:bg-indigo-50 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
                      {conv.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{conv.time}</p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatHistory;
