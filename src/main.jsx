

import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./api/queryClient";

import { AuthProvider } from "./auth/AuthContext";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { LogoSettingsProvider } from "./context/LogoSettingsContext";
import { ProfileProvider } from "./context/ProfileContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppSettingsProvider>
        <LogoSettingsProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </LogoSettingsProvider>
      </AppSettingsProvider>
    </AuthProvider>
  </QueryClientProvider>,
);
