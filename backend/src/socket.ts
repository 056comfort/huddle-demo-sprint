import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Server as HttpServer } from "http";

import prisma from "./config/prisma";

interface JwtPayload {
  userId: string;
}

interface CallTargetPayload {
  targetUserId: string;
  callId: string;
  type: "voice" | "video";
}

interface SignalPayload {
  targetUserId: string;
  callId: string;
  offer?: unknown;
  answer?: unknown;
  candidate?: unknown;
}

interface CallActionPayload {
  targetUserId: string;
  callId: string;
  type: "voice" | "video";
}

interface ChannelCallPayload {
  channelId: string;
  callId: string;
  type: "voice" | "video";
}

interface ChannelSignalPayload {
  channelId: string;
  callId: string;
  targetUserId: string;
  offer?: unknown;
  answer?: unknown;
  candidate?: unknown;
}

// Keeps track of which sockets belong to each user.
const userSockets = new Map<string, Set<string>>();

// Keeps track of users currently participating in channel calls.
const channelCallUsers = new Map<
  string,
  Map<string, string>
>();

export const isUserOnline = (userId: string) => {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
};

export const initializeSocket = (
  httpServer: HttpServer
) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // SOCKET AUTHENTICATION
  io.use((socket, next) => {
    try {
      const authorizationHeader =
        socket.handshake.headers.authorization;

      const token =
        socket.handshake.auth?.token ||
        (authorizationHeader
          ? authorizationHeader.replace("Bearer ", "")
          : undefined);

      if (!token) {
        return next(
          new Error("Authentication token required")
        );
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        console.error(
          "JWT_SECRET is not configured"
        );

        return next(
          new Error(
            "Server authentication is not configured"
          )
        );
      }

      const decoded = jwt.verify(
        token,
        secret
      ) as JwtPayload;

      if (!decoded.userId) {
        return next(
          new Error("Invalid authentication token")
        );
      }

      socket.data.userId = decoded.userId;

      next();
    } catch (error) {
      console.error(
        "Socket authentication error:",
        error
      );

      next(
        new Error("Invalid authentication token")
      );
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    console.log(
      `User connected to Socket.IO: ${userId}`
    );

    // Register this socket under the authenticated user.
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
      socket.broadcast.emit("user:online", { userId });
    }

    userSockets.get(userId)!.add(socket.id);

    socket.on("presence:request", () => {
      const onlineUsers = Array.from(userSockets.keys());
      socket.emit("presence:initial", { onlineUsers });
    });

    /*
    ============================================================
    DIRECT 1-TO-1 CALLING
    ============================================================
    */

    // CALL INITIATED
    socket.on(
      "call:initiate",
      (data: CallTargetPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.type
        ) {
          return;
        }

        if (
          data.type !== "voice" &&
          data.type !== "video"
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          socket.emit("call:unavailable", {
            callId: data.callId,
            message:
              "The user is not currently connected.",
          });

          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:incoming",
            {
              callId: data.callId,
              callerId: userId,
              type: data.type,
            }
          );
        }
      }
    );

    // CALL ACCEPTED
    socket.on(
      "call:accept",
      (data: CallActionPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.type
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:accepted",
            {
              callId: data.callId,
              userId,
              type: data.type,
            }
          );
        }
      }
    );

    // CALL REJECTED
    socket.on(
      "call:reject",
      (data: CallActionPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.type
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:rejected",
            {
              callId: data.callId,
              userId,
            }
          );
        }
      }
    );

    // WEBRTC OFFER
    socket.on(
      "call:offer",
      (data: SignalPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.offer
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:offer",
            {
              callId: data.callId,
              callerId: userId,
              offer: data.offer,
            }
          );
        }
      }
    );

    // WEBRTC ANSWER
    socket.on(
      "call:answer",
      (data: SignalPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.answer
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:answer",
            {
              callId: data.callId,
              userId,
              answer: data.answer,
            }
          );
        }
      }
    );

    // ICE CANDIDATE
    socket.on(
      "call:ice-candidate",
      (data: SignalPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.candidate
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:ice-candidate",
            {
              callId: data.callId,
              userId,
              candidate: data.candidate,
            }
          );
        }
      }
    );

    // END CALL
    socket.on(
      "call:end",
      (data: CallActionPayload) => {
        if (
          !data?.targetUserId ||
          !data?.callId ||
          !data?.type
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "call:ended",
            {
              callId: data.callId,
              userId,
            }
          );
        }
      }
    );

    /*
    ============================================================
    CHANNEL / GROUP CALLING
    ============================================================
    */

    // JOIN CHANNEL CALL
    socket.on(
      "channel-call:join",
      async (data: ChannelCallPayload) => {
        try {
          if (
            !data?.channelId ||
            !data?.callId ||
            !data?.type
          ) {
            socket.emit("channel-call:error", {
              message:
                "channelId, callId and type are required.",
            });

            return;
          }

          if (
            data.type !== "voice" &&
            data.type !== "video"
          ) {
            socket.emit("channel-call:error", {
              message:
                "Call type must be voice or video.",
            });

            return;
          }

          /*
           * Make sure the authenticated user is actually
           * a member of the requested channel.
           */
          const membership =
            await prisma.channelMember.findUnique({
              where: {
                channelId_userId: {
                  channelId: data.channelId,
                  userId,
                },
              },
            });

          if (!membership) {
            socket.emit("channel-call:error", {
              message:
                "You are not a member of this channel.",
            });

            return;
          }

          const roomName =
            `channel-call:${data.channelId}`;

          await socket.join(roomName);

          if (!channelCallUsers.has(data.channelId)) {
            channelCallUsers.set(
              data.channelId,
              new Map()
            );
          }

          const participants =
            channelCallUsers.get(data.channelId)!;

          /*
           * Store the user's socket ID.
           */
          participants.set(userId, socket.id);

          /*
           * Tell the joining user who is already
           * participating in the call.
           */
          const existingParticipants =
            Array.from(participants.keys()).filter(
              (participantId) =>
                participantId !== userId
            );

          socket.emit(
            "channel-call:participants",
            {
              channelId: data.channelId,
              callId: data.callId,
              participants:
                existingParticipants,
            }
          );

          /*
           * Tell everyone else in the channel call
           * that a new participant has joined.
           */
          socket.to(roomName).emit(
            "channel-call:participant-joined",
            {
              channelId: data.channelId,
              callId: data.callId,
              userId,
              type: data.type,
            }
          );

          console.log(
            `User ${userId} joined channel call ${data.channelId}`
          );
        } catch (error) {
          console.error(
            "Channel call join error:",
            error
          );

          socket.emit("channel-call:error", {
            message:
              "Unable to join the channel call.",
          });
        }
      }
    );

    // LEAVE CHANNEL CALL
    socket.on(
      "channel-call:leave",
      (data: ChannelCallPayload) => {
        if (
          !data?.channelId ||
          !data?.callId
        ) {
          return;
        }

        const roomName =
          `channel-call:${data.channelId}`;

        socket.leave(roomName);

        const participants =
          channelCallUsers.get(data.channelId);

        if (participants) {
          participants.delete(userId);

          if (participants.size === 0) {
            channelCallUsers.delete(
              data.channelId
            );
          }
        }

        socket.to(roomName).emit(
          "channel-call:participant-left",
          {
            channelId: data.channelId,
            callId: data.callId,
            userId,
          }
        );

        console.log(
          `User ${userId} left channel call ${data.channelId}`
        );
      }
    );

    /*
     * CHANNEL WEBRTC OFFER
     *
     * The frontend sends an offer to one specific
     * participant.
     */
    socket.on(
      "channel-call:offer",
      (data: ChannelSignalPayload) => {
        if (
          !data?.channelId ||
          !data?.callId ||
          !data?.targetUserId ||
          !data?.offer
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "channel-call:offer",
            {
              channelId: data.channelId,
              callId: data.callId,
              userId,
              offer: data.offer,
            }
          );
        }
      }
    );

    /*
     * CHANNEL WEBRTC ANSWER
     */
    socket.on(
      "channel-call:answer",
      (data: ChannelSignalPayload) => {
        if (
          !data?.channelId ||
          !data?.callId ||
          !data?.targetUserId ||
          !data?.answer
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "channel-call:answer",
            {
              channelId: data.channelId,
              callId: data.callId,
              userId,
              answer: data.answer,
            }
          );
        }
      }
    );

    /*
     * CHANNEL ICE CANDIDATE
     */
    socket.on(
      "channel-call:ice-candidate",
      (data: ChannelSignalPayload) => {
        if (
          !data?.channelId ||
          !data?.callId ||
          !data?.targetUserId ||
          !data?.candidate
        ) {
          return;
        }

        const targetSockets =
          userSockets.get(data.targetUserId);

        if (!targetSockets) {
          return;
        }

        for (const socketId of targetSockets) {
          io.to(socketId).emit(
            "channel-call:ice-candidate",
            {
              channelId: data.channelId,
              callId: data.callId,
              userId,
              candidate: data.candidate,
            }
          );
        }
      }
    );

    /*
    ============================================================
    DISCONNECT
    ============================================================
    */

    socket.on("disconnect", () => {
      console.log(
        `User disconnected from Socket.IO: ${userId}`
      );

      /*
       * Remove this socket from the user's socket list.
       */
      const sockets =
        userSockets.get(userId);

      if (sockets) {
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          userSockets.delete(userId);
          socket.broadcast.emit("user:offline", { userId });
        }
      }

      /*
       * Remove the user from any channel calls
       * they were participating in.
       */
      for (const [
        channelId,
        participants,
      ] of channelCallUsers.entries()) {
        const participantSocket =
          participants.get(userId);

        if (
          participantSocket !== socket.id
        ) {
          continue;
        }

        participants.delete(userId);

        const roomName =
          `channel-call:${channelId}`;

        socket.to(roomName).emit(
          "channel-call:participant-left",
          {
            channelId,
            userId,
          }
        );

        if (participants.size === 0) {
          channelCallUsers.delete(channelId);
        }
      }
    });
  });

  return io;
};
