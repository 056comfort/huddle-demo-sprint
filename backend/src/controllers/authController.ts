import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { sendEmail } from "../services/emailService";

const RESET_TOKEN_EXPIRY = "1h";
const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const getFrontendUrl = () =>
  process.env.FRONTEND_URL || "http://localhost:5173";

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

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationExpires = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRY_MS
    );

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    const verificationLink =
      `${getFrontendUrl()}/verify-email?token=${verificationToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Verify your Huddle account",
        html: `
          <h2>Welcome to Huddle, ${user.name}!</h2>

          <p>Thanks for creating your account.</p>

          <p>
            Please verify your email address by clicking the button below:
          </p>

          <p>
            <a
              href="${verificationLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#000;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Verify Email
            </a>
          </p>

          <p>This verification link expires in 24 hours.</p>

          <p>If you did not create this account, you can ignore this email.</p>
        `,
      });
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      // Remove the user if the verification email could not be sent.
      await prisma.user.delete({
        where: { id: user.id },
      });

      return res.status(500).json({
        message: "Account could not be created because the verification email failed to send",
      });
    }

    return res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (
  req: Request,
  res: Response
) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification link",
      });
    }

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      return res.status(400).json({
        message: "Verification link has expired",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.json({
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);

    return res.status(500).json({
      message: "Email verification failed",
    });
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

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
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

    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
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

    // Login confirmation email
    try {
      await sendEmail({
        to: user.email,
        subject: "New login to your Huddle account",
        html: `
          <h2>Login confirmation</h2>

          <p>Hello ${user.name},</p>

          <p>
            Your Huddle account was just used to log in.
          </p>

          <p>
            If this was you, no action is required.
          </p>

          <p>
            If you did not log in, please reset your password immediately.
          </p>
        `,
      });
    } catch (emailError) {
      // Don't prevent a valid login if the confirmation email fails.
      console.error("Login confirmation email error:", emailError);
    }

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

// FORGOT PASSWORD
export const forgotPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always respond 200 to prevent user enumeration.
    if (!user) {
      return res.json({
        message:
          "If that email is registered, a reset link has been sent.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "Server misconfiguration",
      });
    }

    // Using the current password hash makes the token invalid
    // after the password is changed.
    const tokenSecret = `${secret}${user.password}`;

    const token = jwt.sign(
      { userId: user.id },
      tokenSecret,
      {
        expiresIn: RESET_TOKEN_EXPIRY,
      }
    );

    const resetLink =
      `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(user.id)}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your Huddle password",
        html: `
          <h2>Password reset</h2>

          <p>Hello ${user.name},</p>

          <p>
            We received a request to reset your Huddle password.
          </p>

          <p>
            Click the button below to choose a new password:
          </p>

          <p>
            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#000;
                color:#fff;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>This link expires in 1 hour.</p>

          <p>
            If you did not request a password reset, you can safely ignore this email.
          </p>
        `,
      });
    } catch (emailError) {
      console.error("Password reset email error:", emailError);
    }

    return res.json({
      message:
        "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Request failed",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (
  req: Request,
  res: Response
) => {
  try {
    const { token, uid, newPassword } = req.body;

    if (!token || !uid || !newPassword) {
      return res.status(400).json({
        message: "token, uid, and newPassword are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return res.status(500).json({
        message: "Server misconfiguration",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link",
      });
    }

    const tokenSecret = `${secret}${user.password}`;

    try {
      jwt.verify(token, tokenSecret);
    } catch {
      return res.status(400).json({
        message: "Reset link has expired or already been used",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: uid },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Password reset failed",
    });
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
        emailVerified: true,
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