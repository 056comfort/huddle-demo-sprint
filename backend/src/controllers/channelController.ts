import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE CHANNEL
export const createChannel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const { name, description } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Channel name is required",
      });
    }

    const channelName = name.trim();

    const existingChannel = await prisma.channel.findUnique({
      where: {
        name: channelName,
      },
    });

    if (existingChannel) {
      return res.status(409).json({
        message: "A channel with this name already exists",
      });
    }

    const channel = await prisma.channel.create({
      data: {
        name: channelName,
        description:
          description && description.trim()
            ? description.trim()
            : null,

        members: {
          create: {
            userId: currentUserId,
          },
        },
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    console.error("Create channel error:", error);

    return res.status(500).json({
      message: "Failed to create channel",
    });
  }
};

// GET ALL CHANNELS
export const getChannels = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const channels = await prisma.channel.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return res.status(200).json({
      channels,
    });
  } catch (error) {
    console.error("Get channels error:", error);

    return res.status(500).json({
      message: "Failed to get channels",
    });
  }
};

// GET CHANNEL BY ID
export const getChannelById = async (
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
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    if (!channel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    return res.status(200).json({
      channel,
    });
  } catch (error) {
    console.error("Get channel error:", error);

    return res.status(500).json({
      message: "Failed to get channel",
    });
  }
};

// UPDATE CHANNEL
export const updateChannel = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const channelId = req.params.channelId as string;
    const { name, description } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this channel",
      });
    }

    const existingChannel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!existingChannel) {
      return res.status(404).json({
        message: "Channel not found",
      });
    }

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        message: "Channel name cannot be empty",
      });
    }

    if (name !== undefined && name.trim() !== existingChannel.name) {
      const duplicateChannel =
        await prisma.channel.findUnique({
          where: {
            name: name.trim(),
          },
        });

      if (
        duplicateChannel &&
        duplicateChannel.id !== channelId
      ) {
        return res.status(409).json({
          message:
            "A channel with this name already exists",
        });
      }
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
      include: {
        members: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            messages: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Channel updated successfully",
      channel: updatedChannel,
    });
  } catch (error) {
    console.error("Update channel error:", error);

    return res.status(500).json({
      message: "Failed to update channel",
    });
  }
};

// DELETE CHANNEL
export const deleteChannel = async (
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

    const membership = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: {
          channelId,
          userId: currentUserId,
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

    await prisma.channel.delete({
      where: {
        id: channelId,
      },
    });

    return res.status(200).json({
      message: "Channel deleted successfully",
    });
  } catch (error) {
    console.error("Delete channel error:", error);

    return res.status(500).json({
      message: "Failed to delete channel",
    });
  }
};