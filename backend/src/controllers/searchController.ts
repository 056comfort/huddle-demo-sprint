import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

export const search = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const query = String(req.query.q || "").trim();

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!query) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const [users, channels, messages, channelMessages] =
      await Promise.all([
        // Search users
        prisma.user.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
            id: {
              not: currentUserId,
            },
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 20,
        }),

        // Search channels
        prisma.channel.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          take: 20,
        }),

        // Search direct messages
        prisma.message.findMany({
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
            isDeleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            conversationId: true,
            senderId: true,
            createdAt: true,
            updatedAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 20,
        }),

        // Search channel messages
        prisma.channelMessage.findMany({
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
            isDeleted: false,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            content: true,
            channelId: true,
            senderId: true,
            createdAt: true,
            updatedAt: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          take: 20,
        }),
      ]);

    return res.status(200).json({
      query,
      results: {
        users,
        channels,
        messages,
        channelMessages,
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    return res.status(500).json({
      message: "Failed to perform search",
    });
  }
};