
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import { Toaster } from '@/components/ui/toaster';
import { SoulOrbProvider } from './contexts/SoulOrbContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlueprintCacheProvider } from './contexts/BlueprintCacheContext';
import { user360Cleanup } from '@/utils/user-360-cleanup';
import { ErrorBoundary } from './components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  // Initialize 360° cleanup system
  useEffect(() => {
    user360Cleanup.registerCleanup();
    
    // Cleanup on app unmount
    return () => {
      user360Cleanup.cleanup();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LanguageProvider>
              <ModeProvider>
                <SoulOrbProvider>
                  <BlueprintCacheProvider>
                    <Outlet />
                    <Toaster />
                  </BlueprintCacheProvider>
                </SoulOrbProvider>
              </ModeProvider>
            </LanguageProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </div>
  );
}


export default App;
