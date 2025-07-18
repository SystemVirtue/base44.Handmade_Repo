import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import Login from "./Login.jsx";
import Layout from "../Layout.jsx";
import Dashboard from "../Dashboard.jsx";
import DigitalSignage from "../DigitalSignage.jsx";
import VideoOutput from "../VideoOutput.jsx";
import Controls from "../Controls.jsx";
import UILookAndFeel from "../UILookAndFeel.jsx";
import QueueSchedule from "../QueueSchedule.jsx";
import SearchSongs from "../SearchSongs.jsx";
import Scheduler from "../Scheduler.jsx";
import Messages from "../Messages.jsx";
import MusicZoneInfo from "../MusicZoneInfo.jsx";
import ChangeMusicZone from "../ChangeMusicZone.jsx";
import Settings from "../Settings.jsx";

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
      <Route
        path="/queue-schedule"
        element={
          <ProtectedRoute>
            <Layout currentPageName="QueueSchedule">
              <QueueSchedule />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/search-songs"
        element={
          <ProtectedRoute>
            <Layout currentPageName="SearchSongs">
              <SearchSongs />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scheduler"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Scheduler">
              <Scheduler />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Messages">
              <Messages />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/music-zone-info"
        element={
          <ProtectedRoute>
            <Layout currentPageName="MusicZoneInfo">
              <MusicZoneInfo />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-music-zone"
        element={
          <ProtectedRoute>
            <Layout currentPageName="ChangeMusicZone">
              <ChangeMusicZone />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout currentPageName="Settings">
              <Settings />
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
