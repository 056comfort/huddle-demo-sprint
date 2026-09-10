import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// JOIN CHANNEL
export const joinChannel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const channelId = req.params.channelId as string;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
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

    const existingMembership =
      await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId: currentUserId,
          },
        },
      });

    if (existingMembership) {
      return res.status(409).json({
        message: "You are already a member of this channel",
      });
    }

    const membership = await prisma.channelMember.create({
      data: {
        channelId,
        userId: currentUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        channel: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Joined channel successfully",
      membership,
    });
  } catch (error) {
    console.error("Join channel error:", error);

    return res.status(500).json({
      message: "Failed to join channel",
    });
  }
};

// LEAVE CHANNEL
export const leaveChannel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const channelId = req.params.channelId as string;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership =
      await prisma.channelMember.findUnique({
        where: {
          channelId_userId: {
            channelId,
            userId: currentUserId,
          },
        },
      });

    if (!membership) {
      return res.status(404).json({
        message: "You are not a member of this channel",
      });
    }

    await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId: currentUserId,
        },
      },
    });

    return res.json({
      message: "Left channel successfully",
    });
  } catch (error) {
    console.error("Leave channel error:", error);

    return res.status(500).json({
      message: "Failed to leave channel",
    });
  }
};

// GET CHANNEL MEMBERS
export const getChannelMembers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const channelId = req.params.channelId as string;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
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

    const members = await prisma.channelMember.findMany({
      where: {
        channelId,
      },
      orderBy: {
        joinedAt: "asc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    return res.json({
      members,
    });
  } catch (error) {
    console.error("Get channel members error:", error);

    return res.status(500).json({
      message: "Failed to get channel members",
    });
  }
};