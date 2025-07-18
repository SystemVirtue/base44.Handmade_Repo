import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import appInitialization from "../services/app-initialization.js";

// Initialize application services
appInitialization
  .initialize()
  .then((result) => {
    if (result.success) {
      console.log("🎉 DJAMMS ready to rock!");
    } else {
      console.error("⚠️ DJAMMS started with issues:", result.error);
    }
  })
  .catch((error) => {
    console.error("💥 DJAMMS failed to start:", error);
  });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
