
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";

import { Toaster } from "@/components/ui/toaster";
import MainLayout from "./components/Layout/MainLayout";
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
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Index /> },
      { path: "auth", element: <Auth /> },
      { path: "onboarding", element: <ProtectedRoute><MainLayout><Onboarding /></MainLayout></ProtectedRoute> },
      { path: "dashboard", element: <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute> },
      { path: "blueprint", element: <ProtectedRoute><MainLayout><Blueprint /></MainLayout></ProtectedRoute> },
      { path: "companion", element: <ProtectedRoute><MainLayout><Coach /></MainLayout></ProtectedRoute> },
      { path: "coach", element: <Navigate to="/companion" replace /> },
      { path: "tasks", element: <ProtectedRoute><MainLayout><Tasks /></MainLayout></ProtectedRoute> },
      { path: "dreams", element: <ProtectedRoute><MainLayout><Dreams /></MainLayout></ProtectedRoute> },
      { path: "spiritual-growth", element: <ProtectedRoute><MainLayout><SpiritualGrowth /></MainLayout></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute> },
      { path: "test-ephemeris", element: <TestEphemeris /> },
      { path: "human-design-debug", element: <HumanDesignDebug /> },
      { path: "persona-test", element: <PersonaTest /> },
      { path: "seven-layer-test", element: <ProtectedRoute><MainLayout><SevenLayerTest /></MainLayout></ProtectedRoute> },
      { path: "phase3-memory-test", element: <ProtectedRoute><MainLayout><Phase3MemoryTestPage /></MainLayout></ProtectedRoute> },
      { path: "test-environment", element: <ProtectedRoute><MainLayout><TestEnvironmentPage /></MainLayout></ProtectedRoute> },
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
