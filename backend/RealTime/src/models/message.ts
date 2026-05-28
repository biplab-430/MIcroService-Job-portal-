import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IMessage
  extends Document {

  conversationId:
    mongoose.Types.ObjectId;

  senderId: number;

  receiverId: number;

  content: string;

  type:
    | "text"
    | "image"
    | "document";

  mediaUrl?: string;

  status:
    | "sent"
    | "delivered"
    | "seen";

  deletedForEveryone: boolean;

  deletedFor: number[];

  isEdited: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const messageSchema =
  new Schema<IMessage>(
    {
      conversationId: {
        type: Schema.Types.ObjectId,

        ref: "Conversation",

        required: true,

        index: true,
      },

      senderId: {
        type: Number,

        required: true,
      },

      receiverId: {
        type: Number,

        required: true,
      },

      content: {
        type: String,

        default: "",
      },

      type: {
        type: String,

        enum: [
          "text",
          "image",
          "document",
        ],

        default: "text",
      },

      mediaUrl: {
        type: String,
      },

      status: {
        type: String,

        enum: [
          "sent",
          "delivered",
          "seen",
        ],

        default: "sent",
      },

      deletedForEveryone: {
        type: Boolean,

        default: false,
      },

      deletedFor: {
        type: [Number],

        default: [],
      },

      isEdited: {
        type: Boolean,

        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

// ================= INDEXES =================

// fast pagination + chat loading

messageSchema.index({
  conversationId: 1,
  createdAt: -1,
});

// fast text searching

messageSchema.index({
  content: "text",
});

export const Message =
  mongoose.model<IMessage>(
    "Message",
    messageSchema
  );