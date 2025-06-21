
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ModeProvider } from '@/contexts/ModeContext';
import { SoulOrbProvider } from '@/contexts/SoulOrbContext';
import { BlueprintCacheProvider } from '@/contexts/BlueprintCacheContext';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

// Page imports
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Blueprint from '@/pages/Blueprint';
import Coach from '@/pages/Coach';
import Profile from '@/pages/Profile';
import Dreams from '@/pages/Dreams';
import Tasks from '@/pages/Tasks';
import SpiritualGrowth from '@/pages/SpiritualGrowth';
import NotFound from '@/pages/NotFound';
import Onboarding from '@/pages/Onboarding';
import HumanDesignDebug from '@/pages/HumanDesignDebug';
import PersonaTest from '@/pages/PersonaTest';
import TestEphemeris from '@/pages/TestEphemeris';
import SevenLayerTest from '@/pages/SevenLayerTest';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-deep via-soul-purple to-soul-bright">
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <LanguageProvider>
              <ModeProvider>
                <SoulOrbProvider>
                  <BlueprintCacheProvider>
                    <QueryClientProvider client={queryClient}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/blueprint" element={<ProtectedRoute><Blueprint /></ProtectedRoute>} />
                        <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/dreams" element={<ProtectedRoute><Dreams /></ProtectedRoute>} />
                        <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                        <Route path="/spiritual-growth" element={<ProtectedRoute><SpiritualGrowth /></ProtectedRoute>} />
                        <Route path="/human-design-debug" element={<ProtectedRoute><HumanDesignDebug /></ProtectedRoute>} />
                        <Route path="/persona-test" element={<ProtectedRoute><PersonaTest /></ProtectedRoute>} />
                        <Route path="/test-ephemeris" element={<ProtectedRoute><TestEphemeris /></ProtectedRoute>} />
                        <Route path="/seven-layer-test" element={<ProtectedRoute><SevenLayerTest /></ProtectedRoute>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </QueryClientProvider>
                  </BlueprintCacheProvider>
                </SoulOrbProvider>
              </ModeProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}

export default App;
