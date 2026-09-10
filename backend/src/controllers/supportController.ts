import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  SupportTicketPriority,
  SupportTicketStatus,
} from "../generated/enums";

// CREATE SUPPORT TICKET
export const createSupportTicket = async (
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

    const { subject, description, priority } = req.body;

    if (
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        message: "Subject is required",
      });
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        message: "Description is required",
      });
    }

    const selectedPriority =
      priority || SupportTicketPriority.MEDIUM;

    if (
      !Object.values(SupportTicketPriority).includes(
        selectedPriority
      )
    ) {
      return res.status(400).json({
        message:
          "Priority must be LOW, MEDIUM, HIGH or URGENT",
      });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject: subject.trim(),
        description: description.trim(),
        priority: selectedPriority,
      },
    });

    return res.status(201).json({
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error(
      "Create support ticket error:",
      error
    );

    return res.status(500).json({
      message: "Failed to create support ticket",
    });
  }
};

// GET MY SUPPORT TICKETS
export const getSupportTickets = async (
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

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      tickets,
    });
  } catch (error) {
    console.error(
      "Get support tickets error:",
      error
    );

    return res.status(500).json({
      message: "Failed to retrieve support tickets",
    });
  }
};

// GET ONE SUPPORT TICKET
export const getSupportTicketById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId,
      },
    });

    if (!ticket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error(
      "Get support ticket error:",
      error
    );

    return res.status(500).json({
      message: "Failed to retrieve support ticket",
    });
  }
};

// UPDATE SUPPORT TICKET
export const updateSupportTicket = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const existingTicket =
      await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          userId,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    const {
      subject,
      description,
      priority,
      status,
    } = req.body;

    if (
      subject !== undefined &&
      (typeof subject !== "string" ||
        !subject.trim())
    ) {
      return res.status(400).json({
        message: "Subject cannot be empty",
      });
    }

    if (
      description !== undefined &&
      (typeof description !== "string" ||
        !description.trim())
    ) {
      return res.status(400).json({
        message: "Description cannot be empty",
      });
    }

    if (
      priority !== undefined &&
      !Object.values(SupportTicketPriority).includes(
        priority
      )
    ) {
      return res.status(400).json({
        message:
          "Priority must be LOW, MEDIUM, HIGH or URGENT",
      });
    }

    if (
      status !== undefined &&
      !Object.values(SupportTicketStatus).includes(
        status
      )
    ) {
      return res.status(400).json({
        message:
          "Status must be OPEN, IN_PROGRESS, RESOLVED or CLOSED",
      });
    }

    const ticket = await prisma.supportTicket.update({
      where: {
        id: ticketId,
      },
      data: {
        ...(subject !== undefined && {
          subject: subject.trim(),
        }),
        ...(description !== undefined && {
          description: description.trim(),
        }),
        ...(priority !== undefined && {
          priority,
        }),
        ...(status !== undefined && {
          status,
        }),
      },
    });

    return res.status(200).json({
      message: "Support ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error(
      "Update support ticket error:",
      error
    );

    return res.status(500).json({
      message: "Failed to update support ticket",
    });
  }
};

// DELETE SUPPORT TICKET
export const deleteSupportTicket = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.userId;
    const ticketId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!ticketId || Array.isArray(ticketId)) {
      return res.status(400).json({
        message: "Invalid ticket ID",
      });
    }

    const existingTicket =
      await prisma.supportTicket.findFirst({
        where: {
          id: ticketId,
          userId,
        },
      });

    if (!existingTicket) {
      return res.status(404).json({
        message: "Support ticket not found",
      });
    }

    await prisma.supportTicket.delete({
      where: {
        id: ticketId,
      },
    });

    return res.status(200).json({
      message: "Support ticket deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete support ticket error:",
      error
    );

    return res.status(500).json({
      message: "Failed to delete support ticket",
    });
  }
};