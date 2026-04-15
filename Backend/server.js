import express from "express";
import { connectDb } from "./utils/connectDb.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

await connectDb();

app.get("/health", (req, res) => {
  return res.status(200).json({
    msg: "server is working fine",
  });
});

//user routes
app.use("/api/auth", userRouter);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
