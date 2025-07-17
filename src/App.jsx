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
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <Layout currentPageName="Dashboard">
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/digital-signage"
          element={
            <Layout currentPageName="DigitalSignage">
              <DigitalSignage />
            </Layout>
          }
        />
        <Route
          path="/video-output"
          element={
            <Layout currentPageName="VideoOutput">
              <VideoOutput />
            </Layout>
          }
        />
        <Route
          path="/controls"
          element={
            <Layout currentPageName="Controls">
              <Controls />
            </Layout>
          }
        />
        <Route
          path="/ui-look-and-feel"
          element={
            <Layout currentPageName="UILookAndFeel">
              <UILookAndFeel />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
