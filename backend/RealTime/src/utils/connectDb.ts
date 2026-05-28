import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_DB_URL as string);

    console.log(`MongoDB Connected  to your system `);
  } catch (error) {
    console.log("MongoDB connection error:", error);

    process.exit(1);
  }
};

export default connectDB;