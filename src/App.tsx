
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Index from './pages/Index';
import Dreams from './pages/Dreams';
import SpiritualGrowth from './pages/SpiritualGrowth';
import Coach from './pages/Coach';
import Auth from './pages/Auth';
import Blueprint from './pages/Blueprint';
import Profile from './pages/Profile';
import TestEnvironmentPage from './pages/TestEnvironmentPage';
import { TestFunctionsPage } from './pages/TestFunctionsPage';
import DesignAnalysisPage from './pages/DesignAnalysisPage';
import User360Page from './pages/User360Page';
import HermeticIntelligenceTest from './pages/HermeticIntelligenceTest';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { SoulOrbProvider } from './contexts/SoulOrbContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlueprintCacheProvider } from './contexts/BlueprintCacheContext';
import AdminDashboard from "@/pages/AdminDashboard";
import { user360Cleanup } from '@/utils/user-360-cleanup';
import { useBlueprintFactsAutomation } from '@/hooks/use-blueprint-facts-automation';
import { useAuth } from '@/contexts/AuthContext';

import { AutomationWrapper } from '@/components/AutomationWrapper';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AutomationWrapper>
            <LanguageProvider>
              <ModeProvider>
                <SoulOrbProvider>
                  <BlueprintCacheProvider>
                    <div className="min-h-screen bg-background">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/dreams/*" element={<ProtectedRoute><MainLayout><Dreams /></MainLayout></ProtectedRoute>} />
                        <Route path="/spiritual-growth" element={<ProtectedRoute><MainLayout><SpiritualGrowth /></MainLayout></ProtectedRoute>} />
                        <Route path="/companion" element={<ProtectedRoute><MainLayout><Coach /></MainLayout></ProtectedRoute>} />
                        {/* Legacy redirect from /coach to /companion */}
                        <Route path="/coach" element={<Navigate to="/companion" replace />} />
                        <Route path="/blueprint" element={<ProtectedRoute><MainLayout><Blueprint /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                        <Route path="/user-360" element={<ProtectedRoute><MainLayout><User360Page /></MainLayout></ProtectedRoute>} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/test-environment" element={<ProtectedRoute><MainLayout><TestEnvironmentPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/test-functions" element={<ProtectedRoute><MainLayout><TestFunctionsPage /></MainLayout></ProtectedRoute>} />
                        <Route path="/test-hermetic-intelligence" element={<ProtectedRoute><MainLayout><HermeticIntelligenceTest /></MainLayout></ProtectedRoute>} />
                        <Route path="/design-analysis" element={<ProtectedRoute><DesignAnalysisPage /></ProtectedRoute>} />
                        <Route 
                          path="/admin" 
                          element={
                            <ProtectedRoute>
                              <MainLayout>
                                <AdminDashboard />
                              </MainLayout>
                            </ProtectedRoute>
                          } 
                        />
                        {/* Catch-all route for 404s - MUST be last */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </div>
                  </BlueprintCacheProvider>
                </SoulOrbProvider>
              </ModeProvider>
            </LanguageProvider>
          </AutomationWrapper>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


export default App;
