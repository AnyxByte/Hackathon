import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
        role: {
          type: String,
          enum: ["read", "write"],
          default: "read",
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    lastDiseaseContext: {
      type: String,
    },
    messages: [
      {
        role: {
          type: String,
          required: true,
          enum: ["user", "assistant"],
        },
        type: {
          type: String,
          enum: ["text", "structured_report"],
          default: "text",
        },
        content: {
          type: String,
          required: true,
        },
        publications: {
          type: Array,
          default: [],
        },
        trials: {
          type: Array,
          default: [],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

const Conversation = mongoose.model("conversation", conversationSchema);
export default Conversation;
