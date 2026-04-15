import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
      return res.status(400).json({
        msg: "unauthorized",
      });
    }
    const token = bearerToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("auth middleware error");
    return res.status(400).json({
      msg: "unauthorized",
    });
  }
};
