import React from 'react';

const StudyMaterials = () => {
  const materials = [
    { name: 'DBMS_Notes.pdf', subject: 'Database', date: 'Yesterday', size: '2.4 MB' },
    { name: 'OS_Chapter3.pdf', subject: 'Operating System', date: '2 days ago', size: '1.8 MB' },
    { name: 'CN_Networks.pdf', subject: 'Computer Networks', date: '5 days ago', size: '3.1 MB' }
  ];

  const actions = ['Summarize', 'Important Q', 'Quiz', 'Viva Prep', '5 Mark Ans'];

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">My Study Materials</h3>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all">
          + Upload
        </button>
      </div>

      <div className="space-y-4">
        {materials.map((mat, idx) => (
          <div key={idx} className="border border-gray-200 rounded-2xl p-4 hover:border-indigo-300 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
                  📄
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{mat.name}</p>
                  <p className="text-sm text-gray-500">{mat.subject} • {mat.date} • {mat.size}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {actions.map((action, i) => (
                <button
                  key={i}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-600 hover:text-white transition-all"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterials;
