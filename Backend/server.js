import express from "express";
import { connectDb } from "./utils/connectDb.js";
import dotenv from "dotenv";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());

await connectDb();

app.get("/health", (req, res) => {
  return res.status(200).json({
    msg: "server is working fine",
  });
});

//user routes
app.use("/api/auth", userRouter);

app.listen(3000, () => {
  console.log("server started at port 3000");
});
