import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

// GET CURRENT USER
export const getMe = async (
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

    const user = await prisma.user.findUnique({
      where: {
        id: currentUserId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Failed to get current user",
    });
  }
};

// UPDATE CURRENT USER
export const updateMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.userId;
    const { name, email } = req.body;

    if (!currentUserId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (name !== undefined && (!name || !name.trim())) {
      return res.status(400).json({
        message: "Name cannot be empty",
      });
    }

    if (email !== undefined && (!email || !email.trim())) {
      return res.status(400).json({
        message: "Email cannot be empty",
      });
    }

    if (email !== undefined) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          id: {
            not: currentUserId,
          },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already in use",
        });
      }
    }

    const user = await prisma.user.update({
      where: {
        id: currentUserId,
      },
      data: {
        ...(name !== undefined
          ? { name: name.trim() }
          : {}),
        ...(email !== undefined
          ? { email: email.trim().toLowerCase() }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

// GET ALL USERS
export const getUsers = async (
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

    const users = await prisma.user.findMany({
      where: {
        id: {
          not: currentUserId,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Failed to get users",
    });
  }
};

// GET USER BY ID
export const getUserById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      user,
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Failed to get user",
    });
  }
};