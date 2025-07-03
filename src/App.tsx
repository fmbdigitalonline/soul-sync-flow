
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Blueprint from "./pages/Blueprint";
import Coach from "./pages/Coach";
import Dreams from "./pages/Dreams";
import SpiritualGrowth from "./pages/SpiritualGrowth";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/dreams" element={<Dreams />} />
          <Route path="/spiritual-growth" element={<SpiritualGrowth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
