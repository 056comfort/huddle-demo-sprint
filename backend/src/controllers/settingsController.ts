import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET APP SETTINGS
export const getSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    return res.status(200).json({
      settings: {
        notifications: true,
        sound: true,
        emailNotifications: false,
        theme: "system",
      },
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      message: "Failed to get settings",
    });
  }
};

// UPDATE APP SETTINGS
export const updateSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      notifications,
      sound,
      emailNotifications,
      theme,
    } = req.body;

    if (
      notifications !== undefined &&
      typeof notifications !== "boolean"
    ) {
      return res.status(400).json({
        message: "notifications must be a boolean",
      });
    }

    if (
      sound !== undefined &&
      typeof sound !== "boolean"
    ) {
      return res.status(400).json({
        message: "sound must be a boolean",
      });
    }

    if (
      emailNotifications !== undefined &&
      typeof emailNotifications !== "boolean"
    ) {
      return res.status(400).json({
        message: "emailNotifications must be a boolean",
      });
    }

    if (
      theme !== undefined &&
      !["light", "dark", "system"].includes(theme)
    ) {
      return res.status(400).json({
        message: "theme must be light, dark, or system",
      });
    }

    return res.status(200).json({
      message: "Settings updated successfully",
      settings: {
        notifications:
          notifications ?? true,
        sound: sound ?? true,
        emailNotifications:
          emailNotifications ?? false,
        theme: theme ?? "system",
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      message: "Failed to update settings",
    });
  }
};