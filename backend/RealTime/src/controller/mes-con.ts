import { Response } from "express";
import axios from "axios";
import { Conversation } from "../models/conversation.js";
import { Message } from "../models/message.js";
import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.js";
import ErrorHandler from "../utils/errorHandler.js";
import { checkFollowerStatus } from "../config/FollowerCheck.js";
import getBuffer from "../utils/buffer.js";
import { redisClient } from "../config/redis.js";
import { getIo } from "../config/socket.js";
import { sql } from "../utils/db.js";

export const sendMessage = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?.user_id;
    const { receiverId, content } = req.body;
    let type = req.body.type || "text";
    
    if (!senderId) throw new ErrorHandler(401, "Unauthorized");
    if (!receiverId) throw new ErrorHandler(400, "receiverId is required");
    if (!content && !req.file) {
      throw new ErrorHandler(400, "message content or file required");
    }
    if (senderId === Number(receiverId)) {
      throw new ErrorHandler(400, "you cannot message yourself");
    }

    // ================= FOLLOW CHECK =================
    const { iFollowThem, theyFollowMe } = await checkFollowerStatus(
      senderId,
      Number(receiverId)
    );

    if (!iFollowThem) {
      throw new ErrorHandler(403, "you must follow the user first");
    }

    // ================= CONVERSATION (FIXED NUMERIC SORT) =================
    const participants = [senderId, Number(receiverId)].sort((a, b) => a - b);

    let conversation = await Conversation.findOne({ participants });

    // ================= ONE WAY MESSAGE RULE =================
    if (!theyFollowMe && conversation) {
      const alreadySent = await Message.findOne({
        conversationId: conversation._id,
        senderId,
      });

      if (alreadySent) {
        throw new ErrorHandler(
          403,
          "you can only send one message until they follow you back"
        );
      }
    }

    // ================= CREATE CONVERSATION =================
    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }

    // ================= FILE UPLOAD =================
    let mediaUrl = "";

    if (req.file) {
      const file = req.file;
      const fileBuffer = getBuffer(file);

      if (!fileBuffer || !fileBuffer.content) {
        throw new ErrorHandler(500, "failed to process file");
      }

      try {
        const response = await axios.post(
          `${process.env.UPLOAD_SERVICE}/api/utilsService/upload`,
          { buffer: fileBuffer.content }
        );
        mediaUrl = response.data.url;
      } catch (error) {
        console.error(error);
        throw new ErrorHandler(500, "file upload failed");
      }

      type = file.mimetype.startsWith("image") ? "image" : "document";
    }

    // ================= ONLINE STATUS =================
    const receiverSocket = await redisClient.get(`user_socket:${receiverId}`);
    const status = receiverSocket ? "delivered" : "sent";

    // ================= CREATE MESSAGE =================
    const newMessage = await Message.create({
      conversationId: conversation._id,
      senderId,
      receiverId: Number(receiverId),
      content: content || "",
      type,
      mediaUrl,
      status,
    });

    // ================= UPDATE CONVERSATION =================
    await Conversation.findByIdAndUpdate(
      conversation._id,
      {
        $set: { lastMessage: newMessage._id },
        $inc: { [`unreadCount.${receiverId}`]: 1 }
      }
    );

    // ================= REDIS CACHE =================
    const redisKey = `chat:${conversation._id}`;
    await redisClient.lPush(redisKey, JSON.stringify(newMessage));
    await redisClient.lTrim(redisKey, 0, 49);

    // ================= SOCKET EVENT =================
    
    // 1. Send to the Receiver
    if (receiverSocket) {
      getIo().to(receiverSocket).emit("receive_message", newMessage);
      getIo().to(receiverSocket).emit("global_unread_updated");
    }

    // 2. Send back to the Sender
    const senderSocket = await redisClient.get(`user_socket:${senderId}`);
    if (senderSocket) {
      getIo().to(senderSocket).emit("receive_message", newMessage);
      
      // 🚀 CRITICAL FIX: If receiver is online, tell sender it was delivered!
      if (receiverSocket) {
        getIo().to(senderSocket).emit("message_delivered", {
          messageId: newMessage._id,
          conversationId: conversation._id
        });
      }
    }

    res.status(201).json({
      success: true,
      message: newMessage,
    });
  }
);

export const getMessages =
  TryCatch(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const userId =
        req.user?.user_id;

      const conversationId =
        req.query
          .conversationId as string;

      const page =
        Number(req.query.page) ||
        1;

      if (!userId)
        throw new ErrorHandler(
          401,
          "Unauthorized"
        );

      if (!conversationId)
        throw new ErrorHandler(
          400,
          "conversationId is required"
        );

      const limit = 50;

      // ================= REDIS =================
const start = (page - 1) * limit;
const end = start + limit - 1;
const redisKey = `chat:${conversationId}`;

const cachedMessages = await redisClient.lRange(redisKey, start, end);

// ONLY use Redis if it returns the FULL limit, otherwise fallback to Mongo
// to prevent data gaps and premature pagination halts.
if (cachedMessages.length === limit) {
  const parsed = cachedMessages
    .map((msg) => JSON.parse(msg))
    .filter((msg) => !msg.deletedFor?.includes(userId))
    .reverse();

    if (parsed.length === limit) {
      console.log(`🔴 REDIS: Sending ${parsed.length} messages`);
      return res.json({ /* ... */ });
    }

  return res.json({
    success: true,
    source: "redis",
    currentPage: page,
    totalMessages: parsed.length,
    messages: parsed,
  });
}

// ================= MONGODB =================
// If Redis was empty or only had a partial list, fetch directly from source
const skip = (page - 1) * limit;

const messages = await Message.find({
  conversationId,
  deletedFor: { $ne: userId },
})
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean();



res.json({
  success: true,
  source: "mongodb",
  currentPage: page,
  totalMessages: messages.length,
  messages: messages.reverse(),
});
    }
  );

export const deleteMessage = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id;
    const { messageId } = req.params;
    const { deleteType } = req.body;

    if (!userId) throw new ErrorHandler(401, "Unauthorized");
    if (!messageId) throw new ErrorHandler(400, "message id is required");
    if (!deleteType) throw new ErrorHandler(400, "deleteType is required");

    const message = await Message.findById(messageId);
    if (!message) throw new ErrorHandler(404, "message not found");

    const redisKey = `chat:${message.conversationId}`;

    // ================= DELETE FOR EVERYONE =================
    if (deleteType === "everyone") {
      if (message.senderId !== userId) {
        throw new ErrorHandler(403, "you can only delete your own messages");
      }

      message.deletedForEveryone = true;
      message.content = "This message was deleted";
      message.mediaUrl = "";
      await message.save();

      // Bugfix: Evict from Redis so cache forces sync with DB modifications
      await redisClient.del(redisKey);

      const receiverSocket = await redisClient.get(`user_socket:${message.receiverId}`);
      if (receiverSocket) {
        getIo().to(receiverSocket).emit("message_deleted", {
          messageId,
          deleteType: "everyone",
        });
      }

      return res.json({
        success: true,
        message: "message deleted for everyone",
      });
    }

    // ================= DELETE FOR ME =================
    if (deleteType === "me") {
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }

      // Bugfix: Wipe cache so the filtered message disappears immediately for page 1
      await redisClient.del(redisKey);

      return res.json({
        success: true,
        message: "message deleted for you",
      });
    }

    throw new ErrorHandler(400, "invalid delete type");
  }
);

export const getConversations = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id;
    if (!userId) throw new ErrorHandler(401, "Unauthorized");

    const conversations = await Conversation.find({ participants: userId })
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .lean();

    if (conversations.length === 0) {
      return res.status(200).json({ success: true, totalConversations: 0, conversations: [] });
    }

    // ================= PERFORMANCE FIX: BATCH USER QUERIES =================
    const otherParticipantIds = conversations.map((conv: any) =>
      conv.participants.find((id: number) => id !== userId)
    ).filter(Boolean);

    // Single query execution to find all required profiles at once
    const uniqueIds = Array.from(new Set(otherParticipantIds));
    const dbUsers = uniqueIds.length > 0 
      ? await sql`
          SELECT user_id, name, bio, profile_pic 
          FROM users 
          WHERE user_id = ANY(${uniqueIds})
        `
      : [];

    const userMap = new Map(dbUsers.map((u: any) => [u.user_id, u]));

    // Fetch all online statuses in a single Redis pipeline operation
    const pipeline = redisClient.multi();
    uniqueIds.forEach((id) => pipeline.get(`user_socket:${id}`));
    const onlineSockets = await pipeline.exec();
    const onlineMap = new Map(uniqueIds.map((id, index) => [id, !!onlineSockets[index]]));

   const formattedConversations = conversations.map((conversation: any) => {
      const otherParticipantId = conversation.participants.find((id: number) => id !== userId);
      const otherUser = userMap.get(otherParticipantId);
      const isOnline = onlineMap.get(otherParticipantId) || false;

      // ================= NEW: HIDE DELETED LAST MESSAGE =================
      let displayLastMessage = conversation.lastMessage;
      if (displayLastMessage?.deletedFor?.includes(userId)) {
        displayLastMessage = undefined; // Hide it if the user soft-deleted it
      }

      return {
        conversationId: conversation._id,
        user: {
          user_id: otherUser?.user_id,
          name: otherUser?.name,
          bio: otherUser?.bio,
          profile_pic: otherUser?.profile_pic,
          isOnline,
        },
        lastMessage: displayLastMessage, // <-- use the filtered variable
        unreadCount: conversation.unreadCount?.[userId.toString()] || 0,
        updatedAt: conversation.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      totalConversations: formattedConversations.length,
      conversations: formattedConversations,
    });
  }
);

export const markAsRead = TryCatch(
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.user?.user_id;
    const { conversationId } = req.body;

    // ================= VALIDATION =================

    if (!userId) {
      throw new ErrorHandler(401, "Unauthorized");
    }

    if (!conversationId) {
      throw new ErrorHandler(400, "conversationId is required");
    }

    // ================= SAFELY UPDATE CONVERSATION =================
    // Using findOneAndUpdate with $set prevents .set() and .save() crashes
    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId },
      { $set: { [`unreadCount.${userId}`]: 0 } },
   { returnDocument: "after"}
    );

    if (!conversation) {
      throw new ErrorHandler(404, "conversation not found");
    }

    // ================= MARK MESSAGES AS SEEN =================

    await Message.updateMany(
      {
        conversationId,
        receiverId: userId,
        status: { $ne: "seen" },
      },
      {
        $set: { status: "seen" },
      }
    );

    // ================= FIND OTHER USER =================
    
    // Added optional chaining (?.) just in case participants array is empty/undefined
    const otherParticipantId = conversation.participants?.find(
      (id) => id !== userId
    );

    // ================= NOTIFY SENDER =================

    if (otherParticipantId) {
      const senderSocket = await redisClient.get(
        `user_socket:${otherParticipantId}`
      );

      if (senderSocket) {
        // blue ticks
        getIo().to(senderSocket).emit("messages_seen", {
          conversationId,
          seenBy: userId,
        });

        // refresh sender navbar unread badge
        getIo().to(senderSocket).emit("global_unread_updated");
      }
    }

    // ================= UPDATE CURRENT USER NAVBAR =================

    const currentUserSocket = await redisClient.get(
      `user_socket:${userId}`
    );

    if (currentUserSocket) {
      getIo().to(currentUserSocket).emit("global_unread_updated");
    }

    // ================= RESPONSE =================

    res.status(200).json({
      success: true,
      message: "messages marked as seen",
    });
  }
);

export const clearConversation = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id;
    const { conversationId } = req.params;

    if (!userId) throw new ErrorHandler(401, "Unauthorized");
    if (!conversationId) throw new ErrorHandler(400, "conversationId is required");

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new ErrorHandler(404, "conversation not found");

    if (!conversation.participants.includes(userId)) {
      throw new ErrorHandler(403, "you are not part of this conversation");
    }

    // ================= SOFT DELETE =================
    await Message.updateMany(
      { conversationId, deletedFor: { $ne: userId } },
      { $push: { deletedFor: userId } }
    );

   await redisClient.del(`chat:${conversationId}`);

    // ================= NEW: SOCKET EVENT TO CLEAR SIDEBAR =================
    const senderSocket = await redisClient.get(`user_socket:${userId}`);
    if (senderSocket) {
      getIo().to(senderSocket).emit("chat_cleared", { conversationId });
    }

    res.status(200).json({
      success: true,
      message: "conversation cleared successfully",
    });
  }
);

export const getOrCreateConversation = TryCatch(
  async (req: AuthenticatedRequest, res: Response) => {
    const senderId = req.user?.user_id;
    const { receiverId } = req.params;

    if (!senderId) throw new ErrorHandler(401, "Unauthorized");
    if (!receiverId) throw new ErrorHandler(400, "receiverId is required");
    if (senderId === Number(receiverId)) {
      throw new ErrorHandler(400, "invalid conversation");
    }

    const users = await sql`
      SELECT user_id, name, bio, profile_pic 
      FROM users 
      WHERE user_id = ${receiverId}
    `;

    if (users.length === 0) throw new ErrorHandler(404, "user not found");
    const receiver = users[0];

    // ================= FIND CONVERSATION (FIXED NUMERIC SORT) =================
    const participants = [senderId, Number(receiverId)].sort((a, b) => a - b);

    let conversation = await Conversation.findOne({ participants });

    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }

    const onlineUser = await redisClient.get(`user_socket:${receiverId}`);

    res.status(200).json({
      success: true,
      conversation: {
        conversationId: conversation._id,
        participants: conversation.participants,
        user: {
          user_id: receiver.user_id,
          name: receiver.name,
          bio: receiver.bio,
          profile_pic: receiver.profile_pic,
          isOnline: !!onlineUser,
        },
        createdAt: conversation.createdAt,
      },
    });
  }
);

export const editMessage = TryCatch(
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {

    const userId =
      req.user?.user_id;

    const { messageId } =
      req.params;

    const { content } =
      req.body;

    // ================= VALIDATION =================

    if (!userId) {
      throw new ErrorHandler(
        401,
        "Unauthorized"
      );
    }

    if (!messageId) {
      throw new ErrorHandler(
        400,
        "messageId is required"
      );
    }

    if (!content) {
      throw new ErrorHandler(
        400,
        "new content is required"
      );
    }

    if (content.trim().length === 0) {
      throw new ErrorHandler(
        400,
        "message cannot be empty"
      );
    }

    // ================= FIND MESSAGE =================

    const message =
      await Message.findById(
        messageId
      );

    if (!message) {
      throw new ErrorHandler(
        404,
        "message not found"
      );
    }

    // ================= SECURITY CHECK =================

    const conversation =
      await Conversation.findById(
        message.conversationId
      );

    if (
      !conversation ||
      !conversation.participants.includes(
        userId
      )
    ) {
      throw new ErrorHandler(
        403,
        "access denied"
      );
    }

    // ================= OWNER CHECK =================

    if (
      message.senderId !== userId
    ) {
      throw new ErrorHandler(
        403,
        "you can only edit your own messages"
      );
    }

    // ================= DELETED CHECK =================

    if (
      message.deletedForEveryone ||
      message.deletedFor.includes(
        userId
      )
    ) {
      throw new ErrorHandler(
        400,
        "cannot edit deleted message"
      );
    }

    // ================= ONLY TEXT =================

    if (
      message.type !== "text"
    ) {
      throw new ErrorHandler(
        400,
        "only text messages can be edited"
      );
    }

    // ================= OPTIONAL TIME LIMIT =================

    const editWindow =
      15 * 60 * 1000;

    const isExpired =
      Date.now() -
        new Date(
          message.createdAt
        ).getTime() >
      editWindow;

    if (isExpired) {
      throw new ErrorHandler(
        400,
        "edit time expired"
      );
    }

    // ================= UPDATE MESSAGE =================

    message.content =
      content.trim();

    message.isEdited = true;

    await message.save();

    // ================= REDIS CACHE INVALIDATION =================

    const redisKey =
      `chat:${message.conversationId}`;

    await redisClient.del(
      redisKey
    );

    // ================= SOCKET EVENT =================

    const receiverSocket =
      await redisClient.get(
        `user_socket:${message.receiverId}`
      );

    if (receiverSocket) {

      getIo()
        .to(receiverSocket)
        .emit(
          "message_edited",
          {
            messageId:
              message._id,

            conversationId:
              message.conversationId,

            newContent:
              message.content,

            isEdited: true,
          }
        );
    }

    // ================= RESPONSE =================

    res.status(200).json({
      success: true,

      message,
    });
  }
);

export const getGlobalUnreadBadge =
  TryCatch(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {

      const userId =
        req.user?.user_id;

      if (!userId) {
        throw new ErrorHandler(
          401,
          "Unauthorized"
        );
      }

      // ================= FIND CONVERSATIONS =================

      const unreadQueryKey =
        `unreadCount.${userId}`;

      const unreadConversations =
        await Conversation.find({
          participants: userId,

          [unreadQueryKey]: {
            $gt: 0,
          },
        })

          .select(
            "unreadCount"
          )

          .lean();

      // ================= CALCULATE =================

      let totalUnreadMessages =
        0;

      const unreadConversationsCount =
        unreadConversations.length;

      unreadConversations.forEach(
        (conversation: any) => {

          const unreadCount =
            conversation
              .unreadCount?.[
              userId.toString()
            ] || 0;

          totalUnreadMessages +=
            unreadCount;
        }
      );

      // ================= RESPONSE =================

      res.status(200).json({
        success: true,

        unreadConversationsCount,

        totalUnreadMessages,
      });
    }
  );

export const searchMessages =
  TryCatch(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {

      const userId =
        req.user?.user_id;

      const searchQuery =
        req.query
          .searchQuery as string;

      const conversationId =
        req.query
          .conversationId as string;

      // ================= VALIDATION =================

      if (!userId) {
        throw new ErrorHandler(
          401,
          "Unauthorized"
        );
      }

      if (!searchQuery) {
        throw new ErrorHandler(
          400,
          "searchQuery is required"
        );
      }

      if (
        searchQuery
          .trim()
          .length < 2
      ) {
        throw new ErrorHandler(
          400,
          "search query too short"
        );
      }

      // ================= TARGET CONVERSATIONS =================

      let targetConversationIds:
        string[] = [];

      // ================= SINGLE CHAT SEARCH =================

      if (conversationId) {

        const conversation =
          await Conversation.findById(
            conversationId
          );

        if (
          !conversation ||
          !conversation.participants.includes(
            userId
          )
        ) {
          throw new ErrorHandler(
            403,
            "invalid or unauthorized conversation"
          );
        }

        targetConversationIds =
          [conversationId];
      }

      // ================= GLOBAL SEARCH =================

      else {

        const userConversations =
          await Conversation.find({
            participants:
              userId,
          })

            .select("_id")

            .lean();

        targetConversationIds =
          userConversations.map(
            (conversation: any) =>
              conversation._id.toString()
          );
      }

      // ================= EMPTY RESULT =================

      if (
        targetConversationIds.length ===
        0
      ) {
        return res
          .status(200)
          .json({
            success: true,

            totalResults: 0,

            results: [],
          });
      }

      // ================= SEARCH =================

      const searchResults =
        await Message.find({
          conversationId: {
            $in:
              targetConversationIds,
          },

          deletedFor: {
            $ne: userId,
          },

          deletedForEveryone: {
            $ne: true,
          },

          content: {
            $regex:
              searchQuery.trim(),

            $options: "i",
          },
        })

          .sort({
            createdAt: -1,
          })

          .limit(50)

          .lean();

      // ================= RESPONSE =================

      res.status(200).json({
        success: true,

        totalResults:
          searchResults.length,

        results:
          searchResults,
      });
    }
  );

export const searchConversations = TryCatch(
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    const userId = req.user?.user_id;

    const searchQuery =
      req.query.searchQuery as string;

    // ================= VALIDATION =================

    if (!userId) {
      throw new ErrorHandler(
        401,
        "Unauthorized"
      );
    }

    if (!searchQuery) {
      throw new ErrorHandler(
        400,
        "searchQuery is required"
      );
    }

    if (
      searchQuery.trim().length < 1
    ) {
      throw new ErrorHandler(
        400,
        "search query too short"
      );
    }

    // ================= FIND MATCHING USERS =================

    const matchedUsers = await sql`
      SELECT 
        user_id,
        name,
        bio,
        profile_pic
      FROM users
      WHERE
        LOWER(name) LIKE LOWER(${`%${searchQuery}%`})
        OR LOWER(bio) LIKE LOWER(${`%${searchQuery}%`})
      LIMIT 20
    `;

    const matchedUserIds =
      matchedUsers.map(
        (user: any) => user.user_id
      );

    // ================= FIND CONVERSATIONS =================

    const conversations =
      await Conversation.find({
        participants: userId,

        $or: [
          {
            participants: {
              $in: matchedUserIds,
            },
          },
        ],
      })
        .populate("lastMessage")
        .sort({
          updatedAt: -1,
        })
        .lean();

    // ================= FORMAT =================

    const formattedConversations =
      await Promise.all(
        conversations.map(
          async (
            conversation: any
          ) => {
            const otherParticipantId =
              conversation.participants.find(
                (id: number) =>
                  id !== userId
              );

            const otherUser =
              matchedUsers.find(
                (user: any) =>
                  user.user_id ===
                  otherParticipantId
              );

            const onlineUser =
              await redisClient.get(
                `user_socket:${otherParticipantId}`
              );

            return {
              conversationId:
                conversation._id,

              user: {
                user_id:
                  otherUser?.user_id,

                name:
                  otherUser?.name,

                bio:
                  otherUser?.bio,

                profile_pic:
                  otherUser?.profile_pic,

                isOnline:
                  !!onlineUser,
              },

              lastMessage:
                conversation.lastMessage,

              unreadCount:
                conversation
                  .unreadCount?.[
                  userId.toString()
                ] || 0,

              updatedAt:
                conversation.updatedAt,
            };
          }
        )
      );

    // ================= RESPONSE =================

    res.status(200).json({
      success: true,

      totalResults:
        formattedConversations.length,

      conversations:
        formattedConversations,
    });
  }
);

