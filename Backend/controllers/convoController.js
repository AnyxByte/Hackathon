import Conversation from "../models/conversationModel.js";
import Research from "../models/researchModel.js";


export const fetchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await Conversation.find({
      $or: [{ userId: userId }, { "sharedWith.user": userId }],
    });

    return res.status(200).json({
      history,
      msg: "fetched successfully",
    });
  } catch (error) {
    console.error("History Error:", error);
    return res
      .status(500)
      .json({ msg: "Endpoint failed", error: error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const currentUserId = req.user._id;

    const chat = await Conversation.findOne({ sessionId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found.",
      });
    }

    if (chat.userId.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this chat.",
      });
    }

    await Conversation.findOneAndDelete({ sessionId });

    await Research.deleteMany({ sessionId });

    res.status(200).json({
      success: true,
      message: "Chat and associated research data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chat and research data.",
    });
  }
};

export const shareChat = async (req, res) => {
  try {
    const { sessionId, targetUserId, role } = req.body;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId) {
      return res
        .status(400)
        .json({ success: false, message: "Cannot share a chat with yourself" });
    }

    const chat = await Conversation.findOne({ sessionId: sessionId });
    if (!chat) {
      return res
        .status(404)
        .json({ success: false, message: "Chat session not found" });
    }

    if (chat.userId.toString() !== currentUserId) {
      return res
        .status(403)
        .json({ success: false, message: "Only the creator can share chat" });
    }

    const existingShareIndex = chat.sharedWith.findIndex(
      (share) => share.user.toString() === targetUserId,
    );

    if (existingShareIndex !== -1) {
      chat.sharedWith[existingShareIndex].role = role || "read";
    } else {
      chat.sharedWith.push({
        user: targetUserId,
        role: role || "read",
      });
    }

    await chat.save();

    res
      .status(200)
      .json({ success: true, message: "Chat successfully shared." });
  } catch (error) {
    console.error("Share Chat Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while sharing chat." });
  }
};
