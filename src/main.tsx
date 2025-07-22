
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./index.css";

import App from "./App";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Blueprint from "./pages/Blueprint";
import Coach from "./pages/Coach";
import Dreams from "./pages/Dreams";
import SpiritualGrowth from "./pages/SpiritualGrowth";
import Profile from "./pages/Profile";
import TestEnvironmentPage from "./pages/TestEnvironmentPage";
import { TestFunctionsPage } from "./pages/TestFunctionsPage";
import DesignAnalysisPage from "./pages/DesignAnalysisPage";
import User360Page from "./pages/User360Page";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./components/Layout/MainLayout";

// Root layout component - uses App.tsx for provider management
const RootLayout = () => {
  return <App />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Index /> },
      { path: "auth", element: <Auth /> },
      { path: "dreams", element: <ProtectedRoute><MainLayout><Dreams /></MainLayout></ProtectedRoute> },
      { path: "spiritual-growth", element: <ProtectedRoute><MainLayout><SpiritualGrowth /></MainLayout></ProtectedRoute> },
      { path: "companion", element: <ProtectedRoute><MainLayout><Coach /></MainLayout></ProtectedRoute> },
      { path: "coach", element: <Navigate to="/companion" replace /> },
      { path: "blueprint", element: <ProtectedRoute><MainLayout><Blueprint /></MainLayout></ProtectedRoute> },
      { path: "profile", element: <ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute> },
      { path: "user-360", element: <ProtectedRoute><MainLayout><User360Page /></MainLayout></ProtectedRoute> },
      { path: "test-environment", element: <ProtectedRoute><MainLayout><TestEnvironmentPage /></MainLayout></ProtectedRoute> },
      { path: "test-functions", element: <ProtectedRoute><MainLayout><TestFunctionsPage /></MainLayout></ProtectedRoute> },
      { path: "design-analysis", element: <ProtectedRoute><DesignAnalysisPage /></ProtectedRoute> },
      { path: "admin", element: <ProtectedRoute><MainLayout><AdminDashboard /></MainLayout></ProtectedRoute> },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
