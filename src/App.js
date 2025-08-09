import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './Components/LandingPage';
import DashboardPage from './Components/DashboardPage';
import LoginPage from './Components/LoginPage';
import SignUpPage from './Components/SignUpPage';
import SettingsPage from './Components/SettingsPage';
import VerifyEmailPage from './Components/VerifyEmailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Routes>
    </Router>
  );
}

export default App;