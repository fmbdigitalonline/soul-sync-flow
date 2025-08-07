
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Blueprint from "./pages/Blueprint";
import Coach from "./pages/Coach";
import Tasks from "./pages/Tasks";
import Dreams from "./pages/Dreams";
import SpiritualGrowth from "./pages/SpiritualGrowth";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import HumanDesignDebug from "./pages/HumanDesignDebug";
import TestEphemeris from "./pages/TestEphemeris";
import PersonaTest from "./pages/PersonaTest";
import SevenLayerTest from "./pages/SevenLayerTest";
import Phase3MemoryTestPage from "./pages/Phase3MemoryTest";
import TestEnvironmentPage from "./pages/TestEnvironmentPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import HermeticIntelligenceTest from "./pages/HermeticIntelligenceTest";
import { AuthProvider } from "./contexts/AuthContext";
import { BlueprintCacheProvider } from "./contexts/BlueprintCacheContext";
import { SoulOrbProvider } from "./contexts/SoulOrbContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ModeProvider } from "./contexts/ModeContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Create stable QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Root layout component with consistent provider nesting order
const RootLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <ErrorBoundary>
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              <SoulOrbProvider>
                <BlueprintCacheProvider>
                  <Outlet />
                  <Toaster />
                </BlueprintCacheProvider>
              </SoulOrbProvider>
            </ModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "auth", element: <Auth /> },
      { path: "onboarding", element: <ProtectedRoute><Onboarding /></ProtectedRoute> },
      { path: "dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
      { path: "blueprint", element: <ProtectedRoute><Blueprint /></ProtectedRoute> },
      { path: "companion", element: <ProtectedRoute><Coach /></ProtectedRoute> },
      { path: "coach", element: <Navigate to="/companion" replace /> },
      { path: "tasks", element: <ProtectedRoute><Tasks /></ProtectedRoute> },
      { path: "dreams", element: <ProtectedRoute><Dreams /></ProtectedRoute> },
      { path: "spiritual-growth", element: <ProtectedRoute><SpiritualGrowth /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "test-ephemeris", element: <TestEphemeris /> },
      { path: "human-design-debug", element: <HumanDesignDebug /> },
      { path: "persona-test", element: <PersonaTest /> },
      { path: "seven-layer-test", element: <ProtectedRoute><SevenLayerTest /></ProtectedRoute> },
      { path: "phase3-memory-test", element: <ProtectedRoute><Phase3MemoryTestPage /></ProtectedRoute> },
      { path: "test-environment", element: <ProtectedRoute><TestEnvironmentPage /></ProtectedRoute> },
      { path: "test-hermetic-intelligence", element: <ProtectedRoute><HermeticIntelligenceTest /></ProtectedRoute> },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
