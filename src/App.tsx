
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import MainLayout from './components/Layout/MainLayout';
import Index from './pages/Index';
import Dreams from './pages/Dreams';
import SpiritualGrowth from './pages/SpiritualGrowth';
import Coach from './pages/Coach';
import Auth from './pages/Auth';
import Blueprint from './pages/Blueprint';
import Profile from './pages/Profile';
import TestEnvironmentPage from './pages/TestEnvironmentPage';
import { Toaster } from '@/components/ui/toaster';
import { SoulOrbProvider } from './contexts/SoulOrbContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlueprintCacheProvider } from './contexts/BlueprintCacheContext';
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              <SoulOrbProvider>
                <BlueprintCacheProvider>
                  <Routes>
                    <Route path="/" element={<MainLayout><Index /></MainLayout>} />
                    <Route path="/dreams" element={<ProtectedRoute><MainLayout><Dreams /></MainLayout></ProtectedRoute>} />
                    <Route path="/spiritual-growth" element={<ProtectedRoute><MainLayout><SpiritualGrowth /></MainLayout></ProtectedRoute>} />
                    <Route path="/coach" element={<ProtectedRoute><MainLayout><Coach /></MainLayout></ProtectedRoute>} />
                    <Route path="/blueprint" element={<ProtectedRoute><MainLayout><Blueprint /></MainLayout></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/test-environment" element={<ProtectedRoute><MainLayout><TestEnvironmentPage /></MainLayout></ProtectedRoute>} />
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
                  </Routes>
                  <Toaster />
                </BlueprintCacheProvider>
              </SoulOrbProvider>
            </ModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" />;
  }
  return children;
};

export default App;
