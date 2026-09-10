import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// CHECK IF USER BELONGS TO CONVERSATION
const checkMembership = async (
  conversationId: string,
  userId: string
) => {
  return prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
};

// SEND MESSAGE
export const sendMessage = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const conversationId = req.params.id as string;
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

    const membership = await checkMembership(
      conversationId,
      currentUserId
    );

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this conversation",
      });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        conversationId,
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

    // Update conversation's updatedAt
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      message: "Failed to send message",
    });
  }
};

// GET MESSAGES
export const getMessages = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const conversationId = req.params.id as string;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership = await checkMembership(
      conversationId,
      currentUserId
    );

    if (!membership) {
      return res.status(403).json({
        message: "You are not a member of this conversation",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
    console.error("Get messages error:", error);

    return res.status(500).json({
      message: "Failed to get messages",
    });
  }
};

// EDIT MESSAGE
export const editMessage = async (
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

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
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

    const updatedMessage = await prisma.message.update({
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
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Edit message error:", error);

    return res.status(500).json({
      message: "Failed to edit message",
    });
  }
};

// DELETE MESSAGE
export const deleteMessage = async (
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

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
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

    const deletedMessage = await prisma.message.update({
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
      data: deletedMessage,
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      message: "Failed to delete message",
    });
  }
};