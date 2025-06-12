
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SoulOrbProvider } from "@/contexts/SoulOrbContext";
import { AIProvider } from "@/contexts/AIContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Coach from "./pages/Coach";
import Dreams from "./pages/Dreams";
import SpiritualGrowth from "./pages/SpiritualGrowth";
import Onboarding from "./pages/Onboarding";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <SoulOrbProvider>
                <AIProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/coach" element={<Coach />} />
                    <Route path="/dreams" element={<Dreams />} />
                    <Route path="/spiritual-growth" element={<SpiritualGrowth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                  </Routes>
                </AIProvider>
              </SoulOrbProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
