import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// ===== YOUR IMPORTS (AUTH) =====
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateWorkspace from "./pages/CreateWorkspace";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ===== PARTNER'S IMPORTS (CHANNELS) =====
import ChannelInfoPage from "./pages/ChannelInfoPage.jsx";
import ChannelMembersPage from "./pages/ChannelMembersPage.jsx";
import ChannelNotificationsPage from "./pages/ChannelNotificationsPage.jsx";
import ChannelSettingsPage from "./pages/ChannelSettingsPage.jsx";

import SettingsPage from "./pages/SettingsPage.jsx";
import SupportPage from "./pages/SupportPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import JoinChannelPage from "./pages/JoinChannelPage.jsx";
import CreateChannelPage from "./pages/CreateChannelPage.jsx";
import ChannelMessagingPage from "./pages/ChannelMessagingPage.jsx";

import DirectMessagePage from "./pages/DirectMessagePage.jsx";
import NewDirectMessagePage from "./pages/NewDirectMessagePage.jsx";

import CallPage from "./pages/CallPage.jsx";
import ChannelCallPage from "./pages/ChannelCallPage.jsx";

import { PresenceProvider } from "./context/PresenceContext.jsx";

import "./App.css";

function App() {
  return (
    <PresenceProvider>
      <BrowserRouter>
        <Routes>
          {/* =========================
              AUTHENTICATION
          ========================== */}

          <Route path="/" element={<Login />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/create-workspace"
            element={<CreateWorkspace />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          {/* =========================
              WORKSPACE / CHANNELS
          ========================== */}

          <Route
            path="/join-channel"
            element={<JoinChannelPage />}
          />

          <Route
            path="/create-channel"
            element={<CreateChannelPage />}
          />

          {/* =========================
              CHANNEL MESSAGING
          ========================== */}

          <Route
            path="/channel/:channelId"
            element={<ChannelMessagingPage />}
          />

          {/* =========================
              CHANNEL INFORMATION
          ========================== */}

          <Route
            path="/channel/:channelId/info"
            element={<ChannelInfoPage />}
          />

          {/* =========================
              CHANNEL MEMBERS
          ========================== */}

          <Route
            path="/channel/:channelId/members"
            element={<ChannelMembersPage />}
          />

          {/* =========================
              CHANNEL NOTIFICATIONS
          ========================== */}

          <Route
            path="/channel/:channelId/notifications"
            element={<ChannelNotificationsPage />}
          />

          {/* =========================
              CHANNEL SETTINGS
          ========================== */}

          <Route
            path="/channel/:channelId/settings"
            element={<ChannelSettingsPage />}
          />

          {/* =========================
              SETTINGS / SUPPORT / PROFILE
          ========================== */}

          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/support" element={<SupportPage />} />

          <Route path="/profile" element={<ProfilePage />} />

          {/* =========================
              DIRECT MESSAGES
          ========================== */}

          <Route path="/dm/new" element={<NewDirectMessagePage />} />

          <Route
            path="/dm/:userId"
            element={<DirectMessagePage />}
          />

          {/* =========================
              CALLING
          ========================== */}

          <Route
            path="/call/video/:userId"
            element={<CallPage callType="video" targetType="dm" />}
          />

          <Route
            path="/call/audio/:userId"
            element={<CallPage callType="audio" targetType="dm" />}
          />

          <Route
            path="/call/video/channel/:channelId"
            element={<ChannelCallPage callType="video" />}
          />

          <Route
            path="/call/audio/channel/:channelId"
            element={<ChannelCallPage callType="audio" />}
          />

          {/* =========================
              FALLBACK
          ========================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </BrowserRouter>
    </PresenceProvider>
  );
}

export default App;