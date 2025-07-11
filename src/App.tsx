
import React from 'react';
import { Toaster } from '@/components/ui/toaster';

// Simple App component that just provides the Toaster
// All routing is now handled in main.tsx
function App() {
  return (
    <>
      <div id="app-root">
        {/* This will be populated by the router in main.tsx */}
      </div>
      <Toaster />
    </>
  );
}

export default App;
