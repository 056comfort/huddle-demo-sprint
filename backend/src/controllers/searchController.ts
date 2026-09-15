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
        // Search users, excluding the authenticated user.
        prisma.user.findMany({
          where: {
            id: {
              not: currentUserId,
            },
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
          },
          select: {
            id: true,
            name: true,
            email: true,
          },
          take: 20,
        }),

        // Search PUBLIC channels only.
        prisma.channel.findMany({
          where: {
            isPrivate: false,
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

        // Search direct messages only where the authenticated
        // user is a member of the conversation.
        prisma.message.findMany({
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
            isDeleted: false,
            conversation: {
              members: {
                some: {
                  userId: currentUserId,
                },
              },
            },
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

        // Search channel messages only in channels where
        // the authenticated user is a member.
        prisma.channelMessage.findMany({
          where: {
            content: {
              contains: query,
              mode: "insensitive",
            },
            isDeleted: false,
            channel: {
              members: {
                some: {
                  userId: currentUserId,
                },
              },
            },
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
