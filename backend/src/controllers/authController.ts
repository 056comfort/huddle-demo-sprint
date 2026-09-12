import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

const RESET_TOKEN_EXPIRY = "1h"; // reset links expire in 1 hour

// REGISTER
export const register = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};


// LOGIN
export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "JWT secret is not configured",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      secret,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

// FORGOT PASSWORD — issues a reset token
export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond 200 to prevent user enumeration
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    // Sign a token using the user's current password hash as part of the secret
    // This makes the token single-use: once the password changes the token is invalid.
    const tokenSecret = `${secret}${user.password}`;
    const token = jwt.sign({ userId: user.id }, tokenSecret, {
      expiresIn: RESET_TOKEN_EXPIRY,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${token}&uid=${user.id}`;

    // In production: send this via email (e.g. with nodemailer / SendGrid).
    // For now, we log it to the server console so developers can test manually.
    console.log(`[ForgotPassword] Reset link for ${email}: ${resetLink}`);

    return res.json({
      message: "If that email is registered, a reset link has been sent.",
      // Remove the line below before going live — only for demo/dev:
      _devResetLink: resetLink,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Request failed" });
  }
};

// RESET PASSWORD — validates token and updates password
export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, uid, newPassword } = req.body;

    if (!token || !uid || !newPassword) {
      return res.status(400).json({ message: "token, uid, and newPassword are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server misconfiguration" });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Verify token using the same secret (current password hash)
    const tokenSecret = `${secret}${user.password}`;
    try {
      jwt.verify(token, tokenSecret);
    } catch {
      return res.status(400).json({ message: "Reset link has expired or already been used" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: uid },
      data: { password: hashedPassword },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Password reset failed" });
  }
};

// GET CURRENT USER
export const getMe = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
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
    console.error("Get user error:", error);

    return res.status(500).json({
      message: "Failed to get user",
    });
  }
};