import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// ===== YOUR IMPORTS (AUTH) =====
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateWorkspace from "./pages/CreateWorkspace";
import ForgotPassword from "./pages/ForgotPassword";

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
            LANDING PAGE (HOME)
        ========================== */}
        <Route path="/" element={<Landing />} />

        {/* =========================
            AUTHENTICATION
        ========================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-workspace" element={<CreateWorkspace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* =========================
            WORKSPACE / CHANNELS
        ========================== */}
        <Route path="/join-channel" element={<JoinChannelPage />} />
        <Route path="/create-channel" element={<CreateChannelPage />} />

        {/* =========================
            CHANNEL MESSAGING
        ========================== */}
        <Route path="/channel/:channelId" element={<ChannelMessagingPage />} />
        <Route path="/channel/:channelId/info" element={<ChannelInfoPage />} />
        <Route path="/channel/:channelId/members" element={<ChannelMembersPage />} />
        <Route path="/channel/:channelId/notifications" element={<ChannelNotificationsPage />} />
        <Route path="/channel/:channelId/settings" element={<ChannelSettingsPage />} />

        {/* =========================
            GENERAL SETTINGS / SUPPORT / PROFILE
        ========================== */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* =========================
            DIRECT MESSAGES
        ========================== */}
        <Route path="/dm/new" element={<NewDirectMessagePage />} />
        <Route path="/dm/:userId" element={<DirectMessagePage />} />

        {/* =========================
            CALLS
        ========================== */}
        <Route path="/call/video/:userId" element={<CallPage callType="video" targetType="dm" />} />
        <Route path="/call/audio/:userId" element={<CallPage callType="audio" targetType="dm" />} />
        <Route path="/call/video/channel/:channelId" element={<ChannelCallPage callType="video" />} />
        <Route path="/call/audio/channel/:channelId" element={<ChannelCallPage callType="audio" />} />

        {/* =========================
            FALLBACK
        ========================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;