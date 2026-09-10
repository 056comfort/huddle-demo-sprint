import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET CHANNEL SETTINGS
export const getChannelSettings = async (
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

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    const notificationSettings =
      await prisma.channelNotificationSetting.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId,
          },
        },
      });

    return res.status(200).json({
      settings: {
        channel,
        notifications: {
          enabled: notificationSettings?.enabled ?? true,
        },
      },
    });
  } catch (error) {
    console.error("Get channel settings error:", error);

    return res.status(500).json({
      message: "Failed to get channel settings",
    });
  }
};

// UPDATE CHANNEL SETTINGS
export const updateChannelSettings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const channelId = req.params.channelId as string;

    const { name, description, notificationsEnabled } =
      req.body;

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

    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Channel name cannot be empty",
        });
      }

      const existingChannel =
        await prisma.channel.findUnique({
          where: {
            name: name.trim(),
          },
        });

      if (
        existingChannel &&
        existingChannel.id !== channelId
      ) {
        return res.status(409).json({
          message:
            "A channel with this name already exists",
        });
      }
    }

    if (
      notificationsEnabled !== undefined &&
      typeof notificationsEnabled !== "boolean"
    ) {
      return res.status(400).json({
        message: "notificationsEnabled must be a boolean",
      });
    }

    const updatedChannel = await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        ...(name !== undefined && {
          name: name.trim(),
        }),
        ...(description !== undefined && {
          description:
            description && description.trim()
              ? description.trim()
              : null,
        }),
      },
    });

    let notificationSettings = null;

    if (notificationsEnabled !== undefined) {
      notificationSettings =
        await prisma.channelNotificationSetting.upsert({
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
          update: {
            enabled: notificationsEnabled,
          },
          create: {
            channelId,
            userId,
            enabled: notificationsEnabled,
          },
        });
    } else {
      notificationSettings =
        await prisma.channelNotificationSetting.findUnique({
          where: {
            channelId_userId: {
              channelId,
              userId,
            },
          },
        });
    }

    return res.status(200).json({
      message: "Channel settings updated successfully",
      settings: {
        channel: updatedChannel,
        notifications: {
          enabled: notificationSettings?.enabled ?? true,
        },
      },
    });
  } catch (error) {
    console.error(
      "Update channel settings error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update channel settings",
    });
  }
};