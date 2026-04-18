import Conversation from "../models/conversationModel.js";

export const fetchHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const history = await Conversation.find({
      userId,
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
