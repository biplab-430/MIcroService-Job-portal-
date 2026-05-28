import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { redisClient } from "./redis";


let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket: Socket) => {
    console.log("User Connected:", socket.id);

    const userId = socket.handshake.query.userId as string;

    // Save Online User
    if (userId) {
      await redisClient.set(`user_socket:${userId}`, socket.id);

      socket.broadcast.emit("user_online", {
        userId,
      });
    }

    // Typing Event
    socket.on("typing", async ({ receiverId }) => {
      const receiverSocket = await redisClient.get(
        `user_socket:${receiverId}`
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit("typing", {
          senderId: userId,
        });
      }
    });

    // Stop Typing
    socket.on("stop_typing", async ({ receiverId }) => {
      const receiverSocket = await redisClient.get(
        `user_socket:${receiverId}`
      );

      if (receiverSocket) {
        io.to(receiverSocket).emit("stop_typing", {
          senderId: userId,
        });
      }
    });

    // Message Seen
    socket.on("mark_seen", async ({ messageId, senderId }) => {
      const senderSocket = await redisClient.get(
        `user_socket:${senderId}`
      );

      if (senderSocket) {
        io.to(senderSocket).emit("message_seen", {
          messageId,
          receiverId: userId,
        });
      }
    });

    // Disconnect
    socket.on("disconnect", async () => {
      console.log("User Disconnected:", socket.id);

      if (userId) {
        await redisClient.del(`user_socket:${userId}`);

        socket.broadcast.emit("user_offline", {
          userId,
        });
      }
    });
  });

  return io;
};

export const getIo = () => io;