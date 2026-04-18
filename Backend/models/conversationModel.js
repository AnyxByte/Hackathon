import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
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
          default: "text", // Helps React know if it should render cards or just a chat bubble
        },
        content: {
          type: String,
          required: true, // Stores the user's query OR the AI's overview paragraph
        },
        publications: {
          type: Array, // Stores the exact JSON array of top publications
          default: [],
        },
        trials: {
          type: Array, // Stores the exact JSON array of clinical trials
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
