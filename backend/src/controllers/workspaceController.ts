import { Response } from "express";
import crypto from "crypto";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendEmail } from "../services/emailService";

// CREATE WORKSPACE
export const createWorkspace = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const { name } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    console.error("Create workspace error:", error);

    return res.status(500).json({
      message: "Failed to create workspace",
    });
  }
};

// GET WORKSPACES USER CAN ACCESS
export const getWorkspaces = async (
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

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      workspaces,
    });
  } catch (error) {
    console.error("Get workspaces error:", error);

    return res.status(500).json({
      message: "Failed to get workspaces",
    });
  }
};

// GET WORKSPACE BY ID
export const getWorkspaceById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const workspaceId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
          orderBy: {
            joinedAt: "asc",
          },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const isMember = workspace.members.some(
      (member) => member.userId === userId
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You do not have access to this workspace",
      });
    }

    return res.status(200).json({
      workspace,
    });
  } catch (error) {
    console.error("Get workspace error:", error);

    return res.status(500).json({
      message: "Failed to get workspace",
    });
  }
};

// GET WORKSPACE MEMBERS
export const getWorkspaceMembers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const workspaceId = req.params.id as string;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({
        message: "You do not have access to this workspace",
      });
    }

    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
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
          },
        },
      },
    });

    return res.status(200).json({
      members,
    });
  } catch (error) {
    console.error("Get workspace members error:", error);

    return res.status(500).json({
      message: "Failed to get workspace members",
    });
  }
};

// CREATE WORKSPACE INVITATION
export const inviteWorkspaceMember = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const workspaceId = req.params.id as string;
    const { email } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "A valid email address is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).json({
        message: "Only the workspace owner can invite members",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      const existingMembership =
        await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: existingUser.id,
            },
          },
        });

      if (existingMembership) {
        return res.status(409).json({
          message: "User is already a member of this workspace",
        });
      }
    }

    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email: normalizedEmail,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return res.status(409).json({
        message: "An active invitation already exists for this email",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        inviterId: userId,
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    const frontendUrl =
      process.env.FRONTEND_URL || "http://localhost:5173";

    const inviteLink = `${frontendUrl}/workspace/invite/${invite.token}`;

    await sendEmail({
      to: normalizedEmail,
      subject: `You're invited to join ${workspace.name}`,
      html: `
        <h2>You're invited to join ${workspace.name}</h2>

        <p>You have been invited to join the <strong>${workspace.name}</strong> workspace.</p>

        <p>
          Click the link below to accept the invitation:
        </p>

        <p>
          <a href="${inviteLink}">
            Accept Workspace Invitation
          </a>
        </p>

        <p>This invitation expires in 7 days.</p>
      `,
    });

    return res.status(201).json({
      message: "Workspace invitation sent successfully",
      invitation: {
        id: invite.id,
        email: invite.email,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Invite workspace member error:", error);

    return res.status(500).json({
      message: "Failed to send workspace invitation",
    });
  }
};

// ACCEPT WORKSPACE INVITATION
export const acceptWorkspaceInvite = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const token = req.params.token as string;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const invite = await prisma.workspaceInvite.findUnique({
      where: {
        token,
      },
    });

    if (!invite) {
      return res.status(404).json({
        message: "Invitation not found",
      });
    }

    if (invite.acceptedAt) {
      return res.status(400).json({
        message: "This invitation has already been accepted",
      });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        message: "This invitation has expired",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return res.status(403).json({
        message:
          "This invitation was sent to a different email address",
      });
    }

    const existingMembership =
      await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invite.workspaceId,
            userId,
          },
        },
      });

    if (existingMembership) {
      return res.status(409).json({
        message: "You are already a member of this workspace",
      });
    }

    const membership = await prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await prisma.workspaceInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        acceptedAt: new Date(),
      },
    });

    return res.status(200).json({
      message: "Workspace invitation accepted successfully",
      membership,
    });
  } catch (error) {
    console.error("Accept workspace invite error:", error);

    return res.status(500).json({
      message: "Failed to accept workspace invitation",
    });
  }
};

// REMOVE WORKSPACE MEMBER
export const removeWorkspaceMember = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const workspaceId = req.params.id as string;
    const memberId = req.params.userId as string;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.ownerId !== userId) {
      return res.status(403).json({
        message: "Only the workspace owner can remove members",
      });
    }

    if (memberId === workspace.ownerId) {
      return res.status(400).json({
        message: "The workspace owner cannot be removed",
      });
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });

    if (!membership) {
      return res.status(404).json({
        message: "Workspace member not found",
      });
    }

    await prisma.workspaceMember.delete({
      where: {
        id: membership.id,
      },
    });

    return res.status(200).json({
      message: "Workspace member removed successfully",
    });
  } catch (error) {
    console.error("Remove workspace member error:", error);

    return res.status(500).json({
      message: "Failed to remove workspace member",
    });
  }
};