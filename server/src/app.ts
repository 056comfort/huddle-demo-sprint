import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";

import conversationRoutes from "./routes/conversationRoutes";
import messageRoutes from "./routes/messageRoutes";
import messageActionRoutes from "./routes/messageActionRoutes";

import workspaceRoutes from "./routes/workspaceRoutes";

import channelRoutes from "./routes/channelRoutes";
import channelMemberRoutes from "./routes/channelMemberRoutes";
import channelMessageRoutes from "./routes/channelMessageRoutes";
import channelSettingsRoutes from "./routes/channelSettingsRoutes";

import notificationRoutes from "./routes/notificationRoutes";
import searchRoutes from "./routes/searchRoutes";
import settingsRoutes from "./routes/settingsRoutes";

import supportRoutes from "./routes/supportRoutes";

import {
  getMe,
  updateMe,
} from "./controllers/userController";

import {
  getChannelNotifications,
  updateChannelNotificationSettings,
} from "./controllers/notificationController";

import { protect } from "./middleware/authMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    message: "Huddle API is running",
  });
});

// AUTHENTICATION

// Frontend URLs
app.use("/auth", authRoutes);

// Existing API URLs
app.use("/api/auth", authRoutes);

// CURRENT USER
app.get("/api/me", protect, getMe);
app.patch("/api/me", protect, updateMe);

// WORKSPACES
app.use("/workspaces", workspaceRoutes);

// USERS
app.use("/api/users", userRoutes);

// DIRECT MESSAGES
app.use("/api/dms", conversationRoutes);
app.use("/api/dms", messageRoutes);

// MESSAGE ACTIONS
app.use("/api/messages", messageActionRoutes);

// CHANNELS
app.use("/api/channels", channelRoutes);

// CHANNEL MEMBERS
app.use("/api/channels", channelMemberRoutes);

// CHANNEL MESSAGES
app.use("/api/channels", channelMessageRoutes);

// CHANNEL SETTINGS
app.use("/api/channels", channelSettingsRoutes);

// SEARCH
app.use("/api/search", searchRoutes);

// NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);

// CHANNEL NOTIFICATIONS
app.get(
  "/api/channels/:channelId/notifications",
  protect,
  getChannelNotifications
);

app.patch(
  "/api/channels/:channelId/notifications",
  protect,
  updateChannelNotificationSettings
);

// APP SETTINGS
app.use("/api/settings", settingsRoutes);

// SUPPORT
app.use("/api/support", supportRoutes);

export default app;