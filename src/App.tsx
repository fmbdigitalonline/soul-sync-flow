
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SoulOrbProvider } from "@/contexts/SoulOrbContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Blueprint from "@/pages/Blueprint";
import Onboarding from "@/pages/Onboarding";
import Coach from "@/pages/Coach";
import Tasks from "@/pages/Tasks";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Router>
      <AuthProvider>
        <SoulOrbProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/blueprint" element={
              <ProtectedRoute>
                <Blueprint />
              </ProtectedRoute>
            } />
            <Route path="/coach" element={
              <ProtectedRoute>
                <Coach />
              </ProtectedRoute>
            } />
            <Route path="/tasks" element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </SoulOrbProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
