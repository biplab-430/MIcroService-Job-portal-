import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IConversation
  extends Document {

  participants: number[];

  lastMessage:
    | mongoose.Types.ObjectId
    | null;

  unreadCount: Map<string, number>;

  createdAt: Date;

  updatedAt: Date;
}

const conversationSchema =
  new Schema<IConversation>(
    {
      participants: {
        type: [Number],

        required: true,
      },

      lastMessage: {
        type: Schema.Types.ObjectId,

        ref: "Message",

        default: null,
      },

      unreadCount: {
        type: Map,

        of: Number,

        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

// prevent duplicate conversations

conversationSchema.index({
  participants: 1,
});

export const Conversation =
  mongoose.model<IConversation>(
    "Conversation",
    conversationSchema
  );