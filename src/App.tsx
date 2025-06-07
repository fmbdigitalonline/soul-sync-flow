import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Blueprint from './pages/Blueprint';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import TestWasm from './pages/TestWasm';
import TestEphemeris from './pages/TestEphemeris';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/test-wasm" element={<TestWasm />} />
          <Route path="/test-ephemeris" element={<TestEphemeris />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
