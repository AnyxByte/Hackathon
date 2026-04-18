import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "missing fields",
      });
    }

    const userExists = await User.findOne({
      email,
    });

    if (userExists) {
      return res.status(400).json({
        msg: "user already exists",
      });
    }

    let user = await User.create({
      name,
      email,
      password,
      location,
    });

    user = {
      ...user._doc,
      password: undefined,
    };

    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token);

    return res.status(200).json({
      msg: "registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.log("error at registerUser", error);
    return res.status(500).json({
      msg: "server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        msg: "missing fields",
      });
    }

    const userExists = await User.findOne({
      email,
    }).select("+password");

    if (!userExists) {
      return res.status(400).json({
        msg: "user doesn't exist",
      });
    }

    const isValidPassword = await userExists.comparePassword(password);

    if (!isValidPassword) {
      return res.status(400).json({
        msg: "invalid credentials",
      });
    }

    const user = {
      ...userExists._doc,
      password: undefined,
    };

    const token = jwt.sign({ user }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("token", token);

    return res.status(200).json({
      msg: "loggedin successfully",
      token,
      user,
    });
  } catch (error) {
    console.log("error at loginUser", error);
    return res.status(500).json({
      msg: "server error",
    });
  }
};
