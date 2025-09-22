import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import logger from "./middlewares/logger.js";
import profileRoutes from "./routes/profileRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

if (process.env.NODE_ENV !== "production") {
    const dotenv = await import("dotenv");
    dotenv.config();
}

connectDB();

const app = express();
app.use(logger);

//cors
const allowedOrigins = [
    "http://localhost:3000",
    "https://career-path-gen-ai-exchange.vercel.app",
];

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

// Middleware
app.use(express.json());
app.use(helmet());
app.use(
    "/api/",
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/health", healthRoutes);

// Define routes
app.get("/", (req, res) => {
    res.json({ running: true, message: "Server is running..." });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
