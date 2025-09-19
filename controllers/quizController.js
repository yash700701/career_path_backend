import Quiz from "../models/Quiz.js";
import { GoogleGenAI } from "@google/genai";

/**
 * @desc    Initialize new quiz in DB
 * @route   POST /api/quiz/create-quiz
 * @access  Private
 */
export const createQuiz = async (req, res) => {
    try {
        const existingQuiz = await Quiz.findOne({ user: req.user.id });
        if (existingQuiz) {
            await Quiz.deleteOne({ _id: existingQuiz._id });
        }

        const quiz = new Quiz({
            user: req.user.id,
            questions: Array(10).fill({ question: "", answer: "" }),
            completed: false,
        });

        await quiz.save();

        return res.json({
            quizId: quiz.id,
            questions: quiz.questions.map((q, index) => ({
                question: q.question,
                answer: q.answer,
                index,
            })),
            message: "Quiz created. Ready to start.",
        });
    } catch (error) {
        console.error("Create Quiz Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Store user response in DB
 * @route   POST /api/quiz/:quizId/answer
 * @access  Private
 */
export const answerQuestion = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { question, answer, questionIndex } = req.body;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (quiz.completed) {
            return res.status(400).json({ message: "Quiz already completed" });
        }

        if (questionIndex < 0 || questionIndex >= quiz.questions.length) {
            return res.status(400).json({ message: "Invalid question index" });
        }

        quiz.questions[questionIndex].question = question;
        quiz.questions[questionIndex].answer = answer;

        const allAnswered = quiz.questions.every((q) => q.answer.trim() !== "");
        if (allAnswered) {
            quiz.completed = true;
        }

        await quiz.save();

        return res.json({
            quizId: quiz.id,
            completed: quiz.completed,
            questions: quiz.questions.map((q, index) => ({
                question: q.question,
                answer: q.answer,
                index,
            })),
            message: quiz.completed ? "Quiz completed!" : "Answer recorded.",
        });
    } catch (error) {
        console.error("Answer Question Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Generate personalized questions
 * @route   POST /api/quiz/quiz-handler
 * @access  Private
 */
export const quizHandler = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in .env");
            return res.status(500).json({ error: "Server misconfiguration" });
        }

        const { history, userDetail, resumeDetail } = req.body;
        if (!history || !userDetail || !resumeDetail) {
            return res.status(400).json({ error: "Missing required data" });
        }

        const ai = new GoogleGenAI(apiKey);

        const instruction = `You are an AI assistant helping students discover the best career paths by asking personalized, personality-based questions. The student’s profile already includes detailed information extracted from their LinkedIn, resume, and other sources such as education, skills, experience, certifications, and interests.
        Your task is to ask specific, short questions that help understand their personality, motivations, strengths, learning style, and preferences. These should complement the existing data and help create a complete picture that will later be used by another AI model to provide tailored career guidance and suggestions.

        Important rules:
        # Use the provided history of chats to build context and ask follow-up questions naturally.
        # Do not ask questions already covered in the user’s profile.
        # Avoid long, open-ended questions—answers should be short, ideally one or two sentences.
        # Questions should focus on personality traits like problem-solving, stress management, leadership, work preferences, motivation, values, and learning style.
        # Keep the conversation friendly, empathetic, and encouraging.
        # After each answer, wait for the user’s reply before asking the next question.
        # Do not suggest career paths or advice yet—only gather more context to build the user’s profile.

        Example:
        “When you face a challenge, do you prefer to ask for help or solve it on your own?”
        “Do you enjoy working in a structured environment or one that’s more flexible?”
        “What type of tasks keep you motivated and engaged?” 
        User details: ${userDetail}
        Users Resume detail: ${resumeDetail}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history.concat({
                role: "user",
                parts: [{ text: "Please generate the next quiz question." }],
            }),
            config: {
                systemInstruction: instruction,
            },
        });

        res.json({
            text: response.text,
        });
    } catch (error) {
        console.error("Error in /api/quiz-handler:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

/**
 * @desc    Return question answers from DB
 * @route   GET /api/quiz/quiz-handler
 * @access  Private
 */
export const returnQuestionAnswers = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ user: req.user.id });
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (!quiz.completed) {
            return res.status(400).json({ message: "Quiz not completed" });
        }

        return res.json({
            quizId: quiz.id,
            completed: quiz.completed,
            questions: quiz.questions.map((q, index) => ({
                question: q.question,
                answer: q.answer,
                index,
            })),
            message: quiz.completed ? "Quiz completed!" : "Answer recorded.",
        });
    } catch (error) {
        console.error("Answer Question Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
