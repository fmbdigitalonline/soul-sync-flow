
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-deep via-soul-purple to-soul-bright">
      <div>App component - this should not be rendered when using main.tsx router</div>
    </div>
  );
}

export default App;
