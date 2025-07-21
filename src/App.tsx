
import { Toaster } from "@/components/ui/toaster";
import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SoulOrbProvider } from "@/contexts/SoulOrbContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { Analytics } from "@/components/Analytics/Analytics";
import { ResponseTimeProvider } from "@/contexts/ResponseTimeContext";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { FloatingInsights } from "@/components/Insights/FloatingInsights";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <GlobalErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SupabaseProvider>
            <LanguageProvider>
              <AuthProvider>
                <SoulOrbProvider>
                  <ResponseTimeProvider>
                    <div className="relative">
                      <Outlet />
                      <Analytics />
                      <FloatingInsights />
                    </div>
                    <Toaster />
                  </ResponseTimeProvider>
                </SoulOrbProvider>
              </AuthProvider>
            </LanguageProvider>
          </SupabaseProvider>
        </QueryClientProvider>
      </GlobalErrorBoundary>
    </div>
  );
}

export default App;
