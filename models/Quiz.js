import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        questions: [
            {
                question: String,
                answer: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Quiz", quizSchema);
