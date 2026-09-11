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

import "./App.css";

function App() {
  return (
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
            GENERAL SETTINGS
        ========================== */}

        <Route
          path="/settings"
          element={<SettingsPage />}
        />

        {/* =========================
            SUPPORT
        ========================== */}

        <Route
          path="/support"
          element={<SupportPage />}
        />

        {/* =========================
            PROFILE
        ========================== */}

        <Route
          path="/profile"
          element={<ProfilePage />}
        />

        {/* =========================
            NEW DIRECT MESSAGE
        ========================== */}

        <Route
          path="/dm/new"
          element={<NewDirectMessagePage />}
        />

        {/* =========================
            DIRECT MESSAGE
        ========================== */}

        <Route
          path="/dm/:userId"
          element={<DirectMessagePage />}
        />

        {/* =========================
            DIRECT MESSAGE VIDEO CALL
        ========================== */}

        <Route
          path="/call/video/:userId"
          element={
            <CallPage
              callType="video"
              targetType="dm"
            />
          }
        />

        {/* =========================
            DIRECT MESSAGE AUDIO CALL
        ========================== */}

        <Route
          path="/call/audio/:userId"
          element={
            <CallPage
              callType="audio"
              targetType="dm"
            />
          }
        />

        {/* =========================
            CHANNEL VIDEO CALL
        ========================== */}

        <Route
          path="/call/video/channel/:channelId"
          element={
            <ChannelCallPage callType="video" />
          }
        />

        {/* =========================
            CHANNEL AUDIO CALL
        ========================== */}

        <Route
          path="/call/audio/channel/:channelId"
          element={
            <ChannelCallPage callType="audio" />
          }
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
  );
}

export default App;