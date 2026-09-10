import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// CREATE CONVERSATION
export const createConversation = async (
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

    const {
      userIds = [],
      name,
      isGroup = false,
    } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        message: "userIds must be an array",
      });
    }

    // Add the logged-in user to the conversation
    const memberIds = Array.from(
      new Set([currentUserId, ...userIds])
    );

    // DIRECT CONVERSATION
    if (!isGroup) {
      if (memberIds.length !== 2) {
        return res.status(400).json({
          message:
            "A direct conversation must have exactly 2 users",
        });
      }

      const otherUserId = memberIds.find(
        (id) => id !== currentUserId
      );

      if (!otherUserId) {
        return res.status(400).json({
          message: "Another user is required",
        });
      }

      const existingConversation =
        await prisma.conversation.findFirst({
          where: {
            isGroup: false,
            members: {
              every: {
                userId: {
                  in: memberIds,
                },
              },
            },
          },
          include: {
            members: {
              include: {
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

      if (
        existingConversation &&
        existingConversation.members.length === 2
      ) {
        return res.json({
          message: "Conversation already exists",
          conversation: existingConversation,
        });
      }
    }

    // GROUP CONVERSATION
    if (isGroup) {
      if (memberIds.length < 2) {
        return res.status(400).json({
          message:
            "A group conversation must have at least 2 users",
        });
      }

      if (!name || !name.trim()) {
        return res.status(400).json({
          message: "Group name is required",
        });
      }
    }

    // Check that all users exist
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: memberIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (users.length !== memberIds.length) {
      return res.status(404).json({
        message: "One or more users were not found",
      });
    }

    const conversation =
      await prisma.conversation.create({
        data: {
          name: isGroup ? name.trim() : null,
          isGroup,
          members: {
            create: memberIds.map((userId) => ({
              userId,
            })),
          },
        },
        include: {
          members: {
            include: {
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
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);

    return res.status(500).json({
      message: "Failed to create conversation",
    });
  }
};

// GET MY CONVERSATIONS
export const getConversations = async (
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

    const conversations =
      await prisma.conversation.findMany({
        where: {
          members: {
            some: {
              userId: currentUserId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
            select: {
              id: true,
              content: true,
              senderId: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

    // Add unread message count to every conversation
    const conversationsWithUnreadCount =
      await Promise.all(
        conversations.map(async (conversation) => {
          const membership = conversation.members.find(
            (member) => member.userId === currentUserId
          );

          const unreadCount =
            await prisma.message.count({
              where: {
                conversationId: conversation.id,
                senderId: {
                  not: currentUserId,
                },
                isDeleted: false,
                ...(membership?.lastReadAt
                  ? {
                      createdAt: {
                        gt: membership.lastReadAt,
                      },
                    }
                  : {}),
              },
            });

          return {
            ...conversation,
            unreadCount,
          };
        })
      );

    return res.json({
      conversations: conversationsWithUnreadCount,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      message: "Failed to get conversations",
    });
  }
};

// GET CONVERSATION BY ID
export const getConversationById = async (
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

    const conversation =
      await prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },
        include: {
          members: {
            include: {
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

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const isMember = conversation.members.some(
      (member) => member.userId === currentUserId
    );

    if (!isMember) {
      return res.status(403).json({
        message:
          "You are not a member of this conversation",
      });
    }

    return res.json({
      conversation,
    });
  } catch (error) {
    console.error(
      "Get conversation error:",
      error
    );

    return res.status(500).json({
      message: "Failed to get conversation",
    });
  }
};

// MARK CONVERSATION AS READ
export const markConversationAsRead = async (
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

    const membership =
      await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUserId,
          },
        },
      });

    if (!membership) {
      return res.status(403).json({
        message:
          "You are not a member of this conversation",
      });
    }

    const updatedMembership =
      await prisma.conversationMember.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: currentUserId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      });

    return res.json({
      message: "Conversation marked as read",
      lastReadAt: updatedMembership.lastReadAt,
    });
  } catch (error) {
    console.error(
      "Mark conversation as read error:",
      error
    );

    return res.status(500).json({
      message: "Failed to mark conversation as read",
    });
  }
};