export const handleQuery = async (req, res) => {
  try {
    return res.status(200).json({
      msg: "endpoint working successfully",
    });
  } catch (error) {
    return res.status(500).json({
      msg: "endpoint failed",
    });
  }
};
