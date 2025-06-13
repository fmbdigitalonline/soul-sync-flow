
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SoulOrbProvider } from "@/contexts/SoulOrbContext";
import { BlueprintCacheProvider } from "@/contexts/BlueprintCacheContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Coach from "./pages/Coach";
import Dreams from "./pages/Dreams";
import Blueprint from "./pages/Blueprint";
import SpiritualGrowth from "./pages/SpiritualGrowth";
import Onboarding from "./pages/Onboarding";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <LanguageProvider>
              <SoulOrbProvider>
                <BlueprintCacheProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/blueprint" element={<Blueprint />} />
                    <Route path="/coach" element={<Coach />} />
                    <Route path="/dreams" element={<Dreams />} />
                    <Route path="/spiritual-growth" element={<SpiritualGrowth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                  </Routes>
                </BlueprintCacheProvider>
              </SoulOrbProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
