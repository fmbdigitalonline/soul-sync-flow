
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Onboarding from './pages/Onboarding';
import Blueprint from './pages/Blueprint';
import Profile from './pages/Profile';
import Coach from './pages/Coach';
import Tasks from './pages/Tasks';
import Auth from './pages/Auth';
import TestEphemeris from './pages/TestEphemeris';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/blueprint" element={
            <ProtectedRoute>
              <Blueprint />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/coach" element={
            <ProtectedRoute>
              <Coach />
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
          <Route path="/test-ephemeris" element={<TestEphemeris />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
