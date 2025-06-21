
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { BlueprintCacheProvider } from "./contexts/BlueprintCacheContext";
import { SoulOrbProvider } from "./contexts/SoulOrbContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ModeProvider } from "./contexts/ModeContext";

const queryClient = new QueryClient();

// Root layout component that includes the ModeProvider inside the router context
const RootLayout = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BlueprintCacheProvider>
          <SoulOrbProvider>
            <ModeProvider>
              <Outlet />
              <Toaster />
            </ModeProvider>
          </SoulOrbProvider>
        </BlueprintCacheProvider>
      </LanguageProvider>
    </AuthProvider>
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
      { path: "coach", element: <ProtectedRoute><Coach /></ProtectedRoute> },
      { path: "tasks", element: <ProtectedRoute><Tasks /></ProtectedRoute> },
      { path: "dreams", element: <ProtectedRoute><Dreams /></ProtectedRoute> },
      { path: "spiritual-growth", element: <ProtectedRoute><SpiritualGrowth /></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: "test-ephemeris", element: <TestEphemeris /> },
      { path: "human-design-debug", element: <HumanDesignDebug /> },
      { path: "persona-test", element: <PersonaTest /> },
      { path: "seven-layer-test", element: <ProtectedRoute><SevenLayerTest /></ProtectedRoute> },
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
