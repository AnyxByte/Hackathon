import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Hackathon",
    });
    console.log("database connected");
  } catch (error) {
    console.log("error connecting to the database");
    process.exit(1);
  }
};
