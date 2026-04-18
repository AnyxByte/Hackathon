import express from "express";
import { connectDb } from "./utils/connectDb.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";
import queryRouter from "./routes/queryRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { auth } from "./middlewares/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

console.log("client-url", process.env.CLIENT_URL);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  }),
);

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
app.use("/api/v1", queryRouter);

app.listen(port, () => {
  console.log(`server started at port ${port}`);
});
