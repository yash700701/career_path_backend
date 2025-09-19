import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI in environment variables");
}

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1); // Exit process if DB connection fails
    }
};

export default connectDB;
