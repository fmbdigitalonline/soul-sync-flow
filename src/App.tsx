import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Blueprint from "./pages/Blueprint";
import Coach from "./pages/Coach";
import Productivity from "./pages/Productivity";
import SpiritualGrowth from "./pages/SpiritualGrowth";
import Diagnostics from "./pages/Diagnostics";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/spiritual-growth" element={<SpiritualGrowth />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
