import { Response } from "express";



import { redisClient } from "../config/redis";
import { TryCatch } from "../utils/TryCatch";
import { AuthenticatedRequest } from "../middleware/auth";
import ErrorHandler from "../utils/errorHandler";
import { Notification } from "../models/notification";
import { sql } from "../utils/db";


export const getNotifications =
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

      // ================= AUTO MARK AS READ =================

      await Notification.updateMany(
        {
          receiverId: userId,

          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

      // ================= GET NOTIFICATIONS =================

      const notifications =
        await Notification.find({
          receiverId: userId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();

      // ================= GET USER DETAILS =================

      const senderIds = [
        ...new Set(
          notifications.map(
            (n) => n.senderId
          )
        ),
      ];

      const users = await sql`
        SELECT
          user_id,
          name,
          profile_pic,
          bio
        FROM users
        WHERE user_id = ANY(${senderIds})
      `;

      // ================= FORMAT =================

      const formatted =
        await Promise.all(
          notifications.map(
            async (n: any) => {
              const sender =
                users.find(
                  (u: any) =>
                    u.user_id ===
                    n.senderId
                );

              const onlineUser =
                await redisClient.get(
                  `user_socket:${n.senderId}`
                );

              return {
                notificationId:
                  n._id,

                type: n.type,

                message:
                  n.message,

                isRead: true,

                conversationId:
                  n.conversationId,

                relatedMessageId:
                  n.relatedMessageId,

                sender: {
                  user_id:
                    sender?.user_id,

                  name:
                    sender?.name,

                  bio:
                    sender?.bio,

                  profile_pic:
                    sender?.profile_pic,

                  isOnline:
                    !!onlineUser,
                },

                createdAt:
                  n.createdAt,
              };
            }
          )
        );

      // ================= RESPONSE =================

      res.status(200).json({
        success: true,

        totalNotifications:
          formatted.length,

        unreadCount: 0,

        notifications:
          formatted,
      });
    }
  );

export const deleteNotification =
  TryCatch(
    async (
      req: AuthenticatedRequest,
      res: Response
    ) => {
      const userId =
        req.user?.user_id;

      const {
        notificationId,
      } = req.params;

      if (!userId) {
        throw new ErrorHandler(
          401,
          "Unauthorized"
        );
      }

      const deleted =
        await Notification.findOneAndDelete(
          {
            _id: notificationId,

            receiverId: userId,
          }
        );

      if (!deleted) {
        throw new ErrorHandler(
          404,
          "Notification not found"
        );
      }

      res.status(200).json({
        success: true,

        message:
          "Notification deleted successfully",
      });
    }
  );


export const getUnreadNotificationCount =
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

      const unreadCount =
        await Notification.countDocuments(
          {
            receiverId: userId,

            isRead: false,
          }
        );

      res.status(200).json({
        success: true,

        unreadCount,
      });
    }
  );



export const createFollowNotification =
  async (
    followerId: number,
    followingId: number
  ) => {
    // prevent duplicate follow notification

    const existing =
      await Notification.findOne({
        senderId: followerId,

        receiverId: followingId,

        type: "follow",
      });

    if (existing) return;

    await Notification.create({
      senderId: followerId,

      receiverId: followingId,

      type: "follow",

      message:
        "started following you",
    });
  };


export const createFollowBackNotification =
  async (
    followerId: number,
    followingId: number
  ) => {
    // check reverse follow exists

    const reverseFollow =
      await sql`
      SELECT *
      FROM followers
      WHERE follower_id = ${followingId}
      AND following_id = ${followerId}
    `;

    if (
      reverseFollow.length === 0
    )
      return;

    await Notification.create({
      senderId: followerId,

      receiverId: followingId,

      type: "follow_back",

      message:
        "followed you back",
    });
  };



export const createMessageNotification =
  async ({
    senderId,
    receiverId,
    conversationId,
    messageId,
  }: {
    senderId: number;

    receiverId: number;

    conversationId: string;

    messageId: string;
  }) => {
    // check active chat

    const activeConversation =
      await redisClient.get(
        `active_chat:${receiverId}`
      );

    // user already inside chat

    if (
      activeConversation ===
      conversationId
    ) {
      return;
    }

    // remove old unread message notifications
    // optional

    await Notification.deleteMany({
      senderId,

      receiverId,

      type: "message",

      conversationId,
    });

    await Notification.create({
      senderId,

      receiverId,

      type: "message",

      message:
        "sent you a message",

      conversationId,

      relatedMessageId:
        messageId,
    });
  };

// export const getNotificationCount =
//   TryCatch(
//     async (
//       req: AuthenticatedRequest,
//       res: Response
//     ) => {
//       const userId =
//         req.user?.user_id;

//       if (!userId) {
//         throw new ErrorHandler(
//           401,
//           "Unauthorized"
//         );
//       }

//       // unread only
//       const unreadCount =
//         await Notification.countDocuments(
//           {
//             receiverId: userId,

//             isRead: false,
//           }
//         );

//       // total notifications
//       const totalCount =
//         await Notification.countDocuments(
//           {
//             receiverId: userId,
//           }
//         );

//       res.status(200).json({
//         success: true,

//         unreadCount,

//         totalCount,
//       });
//     }
//   );