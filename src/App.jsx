import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./Login.jsx";
import Layout from "../Layout.js";
import Dashboard from "../Dashboard.jsx";
import DigitalSignage from "../DigitalSignage.jsx";
import VideoOutput from "../VideoOutput.jsx";
import Controls from "../Controls.jsx";
import UILookAndFeel from "../UILookAndFeel.jsx";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/digital-signage"
        element={
          <ProtectedRoute>
            <Layout currentPageName="DigitalSignage">
              <DigitalSignage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/video-output"
        element={
          <ProtectedRoute>
            <Layout currentPageName="VideoOutput">
              <VideoOutput />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/controls"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Controls">
              <Controls />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/ui-look-and-feel"
        element={
          <ProtectedRoute>
            <Layout currentPageName="UILookAndFeel">
              <UILookAndFeel />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
