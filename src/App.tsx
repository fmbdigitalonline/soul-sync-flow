
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Onboarding from './pages/Onboarding';
import Blueprint from './pages/Blueprint';
import Profile from './pages/Profile';
import Coach from './pages/Coach';
import Tasks from './pages/Tasks';
import TestEphemeris from './pages/TestEphemeris';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/test-ephemeris" element={<TestEphemeris />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
