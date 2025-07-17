import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Blueprint from "./pages/Blueprint";
import Growth from "./pages/Growth";
import { Toaster } from "@/components/ui/toaster"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SoulOrbProvider } from "./contexts/SoulOrbContext";
import { FloatingHACSOrb } from "./components/hacs/FloatingHACSOrb";
import { StewardIntroductionProvider } from "@/contexts/StewardIntroductionContext";

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SoulOrbProvider>
          <LanguageProvider>
            <AuthProvider>
              <StewardIntroductionProvider>
                <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/10">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/blueprint" element={<Blueprint />} />
                    <Route path="/growth" element={<Growth />} />
                  </Routes>
                </div>
                <FloatingHACSOrb />
                <Toaster />
              </StewardIntroductionProvider>
            </AuthProvider>
          </LanguageProvider>
        </SoulOrbProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
