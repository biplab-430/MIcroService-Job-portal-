import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface INotification
  extends Document {

  senderId: number;

  receiverId: number;

  type:
    | "follow"
    | "follow_back"
    | "message";

  message: string;

  // for message notifications
  conversationId?: mongoose.Types.ObjectId;

  relatedMessageId?: mongoose.Types.ObjectId;

  isRead: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const notificationSchema =
  new Schema<INotification>(
    {
      senderId: {
        type: Number,

        required: true,

        index: true,
      },

      receiverId: {
        type: Number,

        required: true,

        index: true,
      },

      type: {
        type: String,

        enum: [
          "follow",
          "follow_back",
          "message",
        ],

        required: true,
      },

      message: {
        type: String,

        required: true,
      },

      // only for message notification
      conversationId: {
        type: Schema.Types.ObjectId,

        ref: "Conversation",

        default: null,
      },

      relatedMessageId: {
        type: Schema.Types.ObjectId,

        ref: "Message",

        default: null,
      },

      isRead: {
        type: Boolean,

        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// ================= INDEXES =================

// fast notification loading

notificationSchema.index({
  receiverId: 1,
  createdAt: -1,
});

// unread notification count

notificationSchema.index({
  receiverId: 1,
  isRead: 1,
});

// optional duplicate prevention

notificationSchema.index(
  {
    senderId: 1,
    receiverId: 1,
    type: 1,
    conversationId: 1,
  },
  {
    sparse: true,
  }
);

export const Notification =
  mongoose.model<INotification>(
    "Notification",
    notificationSchema
  );