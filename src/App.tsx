import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import MainLayout from './components/Layout/MainLayout';
import HomePage from './pages/HomePage';
import DreamsPage from './pages/DreamsPage';
import SpiritualGrowthPage from './pages/SpiritualGrowthPage';
import CoachPage from './pages/CoachPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import BlueprintPage from './pages/BlueprintPage';
import TestEnvironment from './pages/TestEnvironment';
import { Toaster } from '@/components/ui/toaster';
import { SoulOrbProvider } from './contexts/SoulOrbContext';
import { QueryClient } from 'react-query';
import { BlueprintCacheProvider } from './contexts/BlueprintCacheContext';
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <QueryClient>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              <SoulOrbProvider>
                <BlueprintCacheProvider>
                  <Routes>
                    <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
                    <Route path="/dreams" element={<ProtectedRoute><MainLayout><DreamsPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/spiritual-growth" element={<ProtectedRoute><MainLayout><SpiritualGrowthPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/coach" element={<ProtectedRoute><MainLayout><CoachPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/blueprint" element={<ProtectedRoute><MainLayout><BlueprintPage /></MainLayout></ProtectedRoute>} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/test-environment" element={<ProtectedRoute><MainLayout><TestEnvironment /></MainLayout></ProtectedRoute>} />
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
    </QueryClient>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default App;
