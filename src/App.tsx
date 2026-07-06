import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ModeProvider } from './contexts/ModeContext';
import MainLayout from './components/Layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LegacyRedirect from './components/LegacyRedirect';
import Index from './pages/Index';
import Coach from './pages/Coach';
import Auth from './pages/Auth';
import OnboardingFlow from './pages/OnboardingFlow';
import Blueprint from './pages/Blueprint';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import ReportViewer from './components/ReportViewer';
import { Toaster } from '@/components/ui/toaster';
import { SoulOrbProvider } from './contexts/SoulOrbContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BlueprintCacheProvider } from './contexts/BlueprintCacheContext';
import { user360Cleanup } from '@/utils/user-360-cleanup';

import { AutomationWrapper } from '@/components/AutomationWrapper';

// ---------------------------------------------------------------------------
// Dev-only surfaces (admin, diagnostics, test harnesses).
// Lazy-loaded and only routed when import.meta.env.DEV is true, so they are
// never reachable in production. Files remain intact for local development.
// ---------------------------------------------------------------------------
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard'));
const User360Page = React.lazy(() => import('./pages/User360Page'));
const TestEnvironmentPage = React.lazy(() => import('./pages/TestEnvironmentPage'));
const TestFunctionsPage = React.lazy(() =>
  import('./pages/TestFunctionsPage').then((m) => ({ default: m.TestFunctionsPage }))
);
const HermeticIntelligenceTest = React.lazy(() => import('./pages/HermeticIntelligenceTest'));
const DesignAnalysisPage = React.lazy(() => import('./pages/DesignAnalysisPage'));

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
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            <AutomationWrapper>
              <LanguageProvider>
                <ModeProvider>
                  <SoulOrbProvider>
                    <BlueprintCacheProvider>
                      <div className="min-h-screen bg-background">
                      <Routes>
                        {/* ------------------------------------------------ */}
                        {/* Core product: landing → auth → onboarding → chat */}
                        {/* ------------------------------------------------ */}
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route
                          path="/onboarding"
                          element={
                            <ProtectedRoute>
                              <OnboardingFlow />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="/companion" element={<ProtectedRoute><MainLayout><Coach /></MainLayout></ProtectedRoute>} />
                        <Route path="/blueprint" element={<ProtectedRoute><MainLayout><Blueprint /></MainLayout></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />

                        {/* Report / codex viewer */}
                        <Route path="/reports/view/:jobId" element={<ProtectedRoute><ReportViewer /></ProtectedRoute>} />

                        {/* ------------------------------------------------ */}
                        {/* Legacy redirects — features absorbed by companion */}
                        {/* ------------------------------------------------ */}
                        <Route path="/coach" element={<Navigate to="/companion" replace />} />
                        <Route path="/get-started" element={<Navigate to="/auth" replace />} />
                        <Route
                          path="/dreams/*"
                          element={
                            <LegacyRedirect
                              to="/companion"
                              title="Dreams now live in the conversation"
                              description="Ask your companion about a goal or dream — it can break it into milestones right here."
                            />
                          }
                        />
                        {/* /tasks and /activity were linked from Index but never
                            had routes (latent 404s) — absorbed by companion too */}
                        <Route
                          path="/tasks"
                          element={
                            <LegacyRedirect
                              to="/companion"
                              title="Tasks now live in the conversation"
                              description="Ask your companion what's next — it knows your plans."
                            />
                          }
                        />
                        <Route path="/activity" element={<Navigate to="/companion" replace />} />
                        <Route
                          path="/spiritual-growth"
                          element={
                            <LegacyRedirect
                              to="/companion"
                              title="Growth now lives in the conversation"
                              description="Your companion carries your growth work — just start talking."
                            />
                          }
                        />

                        {/* ------------------------------------------------ */}
                        {/* Dev-only: admin, diagnostics, test harnesses      */}
                        {/* Never routed in production builds                 */}
                        {/* ------------------------------------------------ */}
                        {import.meta.env.DEV && (
                          <>
                            <Route
                              path="/admin"
                              element={
                                <ProtectedRoute>
                                  <MainLayout>
                                    <Suspense fallback={null}>
                                      <AdminDashboard />
                                    </Suspense>
                                  </MainLayout>
                                </ProtectedRoute>
                              }
                            />
                            <Route path="/user-360" element={<ProtectedRoute><MainLayout><Suspense fallback={null}><User360Page /></Suspense></MainLayout></ProtectedRoute>} />
                            <Route path="/test-environment" element={<ProtectedRoute><MainLayout><Suspense fallback={null}><TestEnvironmentPage /></Suspense></MainLayout></ProtectedRoute>} />
                            <Route path="/test-functions" element={<ProtectedRoute><MainLayout><Suspense fallback={null}><TestFunctionsPage /></Suspense></MainLayout></ProtectedRoute>} />
                            <Route path="/test-hermetic-intelligence" element={<ProtectedRoute><MainLayout><Suspense fallback={null}><HermeticIntelligenceTest /></Suspense></MainLayout></ProtectedRoute>} />
                            <Route path="/design-analysis" element={<ProtectedRoute><Suspense fallback={null}><DesignAnalysisPage /></Suspense></ProtectedRoute>} />
                          </>
                        )}

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
      </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
