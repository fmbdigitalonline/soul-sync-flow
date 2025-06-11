
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Blueprint from "@/pages/Blueprint";
import Coach from "@/pages/Coach";
import SpiritualGrowth from "@/pages/SpiritualGrowth";
import Tasks from "@/pages/Tasks";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";
import TestEphemeris from "@/pages/TestEphemeris";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModeProvider } from "@/contexts/ModeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { SoulOrbProvider } from "@/contexts/SoulOrbContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <SoulOrbProvider>
            <ModeProvider>
              <Router>
                <div className="min-h-screen cosmic-bg">
                  <Toaster />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/blueprint" element={<ProtectedRoute><Blueprint /></ProtectedRoute>} />
                    <Route path="/coach" element={<ProtectedRoute><Coach /></ProtectedRoute>} />
                    <Route path="/spiritual-growth" element={<ProtectedRoute><SpiritualGrowth /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/test-ephemeris" element={<TestEphemeris />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </Router>
            </ModeProvider>
          </SoulOrbProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
