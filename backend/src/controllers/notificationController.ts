import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET ALL NOTIFICATIONS
export const getNotifications = async (
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

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      message: "Failed to get notifications",
    });
  }
};

// GET CHANNEL NOTIFICATIONS
export const getChannelNotifications = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const channelId = req.params.channelId as string;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this channel",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        channelId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.isRead
    ).length;

    return res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "Get channel notifications error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get channel notifications",
    });
  }
};

// UPDATE CHANNEL NOTIFICATION SETTINGS
export const updateChannelNotificationSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const channelId = req.params.channelId as string;

    const { enabled } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "enabled must be a boolean",
      });
    }

    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this channel",
      });
    }

    const settings =
      await prisma.channelNotificationSetting.upsert({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
        update: {
          enabled,
        },
        create: {
          channelId,
          userId,
          enabled,
        },
      });

    return res.status(200).json({
      message: "Channel notification settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error(
      "Update channel notification settings error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update channel notification settings",
    });
  }
};