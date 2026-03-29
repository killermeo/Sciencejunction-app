import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import TeacherLogin from './pages/TeacherLogin';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import Tests from './pages/Tests';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import TeacherDashboard from './pages/TeacherDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher-login" element={<TeacherLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </Router>
  );
}

export default App;