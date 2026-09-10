import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

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

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Workspace name is required",
      });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        ownerId: userId,
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

// GET ALL WORKSPACES
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
        ownerId: userId,
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
      },
    });

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.ownerId !== userId) {
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