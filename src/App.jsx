import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login.jsx";
import Layout from "../Layout.js";
import Dashboard from "../Dashboard.jsx";
import DigitalSignage from "../DigitalSignage.jsx";
import VideoOutput from "../VideoOutput.jsx";
import Controls from "../Controls.jsx";
import UILookAndFeel from "../UILookAndFeel.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
