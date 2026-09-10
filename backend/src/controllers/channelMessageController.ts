import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// SEND CHANNEL MESSAGE
export const sendChannelMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const channelId = req.params.channelId as string;
    const { content } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
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

    const message = await prisma.channelMessage.create({
      data: {
        content: content.trim(),
        channelId,
        senderId: currentUserId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      message: "Message sent successfully",
      channelMessage: message,
    });
  } catch (error) {
    console.error("Send channel message error:", error);

    return res.status(500).json({
      message: "Failed to send channel message",
    });
  }
};

// GET CHANNEL MESSAGES
export const getChannelMessages = async (
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

    const messages = await prisma.channelMessage.findMany({
      where: {
        channelId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      messages,
    });
  } catch (error) {
    console.error("Get channel messages error:", error);

    return res.status(500).json({
      message: "Failed to get channel messages",
    });
  }
};

// EDIT CHANNEL MESSAGE
export const editChannelMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const messageId = req.params.messageId as string;
    const { content } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const message = await prisma.channelMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Channel message not found",
      });
    }

    if (message.senderId !== currentUserId) {
      return res.status(403).json({
        message: "You can only edit your own messages",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        message: "Deleted messages cannot be edited",
      });
    }

    const updatedMessage = await prisma.channelMessage.update({
      where: {
        id: messageId,
      },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      message: "Message updated successfully",
      channelMessage: updatedMessage,
    });
  } catch (error) {
    console.error("Edit channel message error:", error);

    return res.status(500).json({
      message: "Failed to edit channel message",
    });
  }
};

// DELETE CHANNEL MESSAGE
export const deleteChannelMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const messageId = req.params.messageId as string;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const message = await prisma.channelMessage.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Channel message not found",
      });
    }

    if (message.senderId !== currentUserId) {
      return res.status(403).json({
        message: "You can only delete your own messages",
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        message: "Message is already deleted",
      });
    }

    await prisma.channelMessage.update({
      where: {
        id: messageId,
      },
      data: {
        isDeleted: true,
        content: "This message was deleted",
      },
    });

    return res.json({
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete channel message error:", error);

    return res.status(500).json({
      message: "Failed to delete channel message",
    });
  }
};