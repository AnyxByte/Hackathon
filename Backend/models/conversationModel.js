import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
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
        content: {
          required: true,
          type: String,
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
