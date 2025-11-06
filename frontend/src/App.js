import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import StudyPlanner from './pages/StudyPlanner';
import QuizGenerator from './pages/QuizGenerator';
import UploadNotes from './pages/UploadNotes';
import Files from './pages/Files';
import FilesSimple from './pages/FilesSimple';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminNotes from './pages/AdminNotes';
import AdminTimetable from './pages/AdminTimetable';
import AdminImportantNotes from './pages/AdminImportantNotes';
import AdminMCQ from './pages/AdminMCQ';
import TestTaker from './pages/TestTaker';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/chat" element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <Documents />
                </ProtectedRoute>
              } />
              <Route path="/study-planner" element={
                <ProtectedRoute>
                  <StudyPlanner />
                </ProtectedRoute>
              } />
              <Route path="/quiz-generator" element={
                <ProtectedRoute>
                  <QuizGenerator />
                </ProtectedRoute>
              } />
              <Route path="/upload-notes" element={
                <ProtectedRoute>
                  <UploadNotes />
                </ProtectedRoute>
              } />
              <Route path="/files" element={
                <ProtectedRoute>
                  <Files />
                </ProtectedRoute>
              } />
              <Route path="/files-full" element={
                <ProtectedRoute>
                  <Files />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/notes" element={
                <AdminProtectedRoute>
                  <AdminNotes />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/timetable" element={
                <AdminProtectedRoute>
                  <AdminTimetable />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/important-notes" element={
                <AdminProtectedRoute>
                  <AdminImportantNotes />
                </AdminProtectedRoute>
              } />
              <Route path="/admin/mcq" element={
                <AdminProtectedRoute>
                  <AdminMCQ />
                </AdminProtectedRoute>
              } />
              <Route path="/test/:testId" element={
                <ProtectedRoute>
                  <TestTaker />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
