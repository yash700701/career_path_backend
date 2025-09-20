import Quiz from "../models/Quiz.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const instruction = `
You are an AI assistant helping students discover the best career paths by asking personalized, personality-based questions. 
The student’s profile already includes detailed information extracted from LinkedIn, resume, and other sources such as education, skills, experience, certifications, and interests.

Your task:
- Ask specific, short questions that help understand their personality, motivations, strengths, learning style, and preferences. 
- Complement the existing data, avoid duplicates. 
- Avoid long, open-ended questions (short answers, ideally one or two sentences).
- Focus on traits like problem-solving, stress management, leadership, work preferences, motivation, values, and learning style.
- Keep the tone friendly, empathetic, and encouraging.
- Do NOT suggest career paths yet—only gather context.
`;

        const response = await model.generateContent({
            contents: [
                ...history,
                {
                    role: "user",
                    parts: [
                        {
                            text: `
Please generate the next quiz question based on the following student profile:

📌 User Profile:
${JSON.stringify(userDetail, null, 2)}

📌 Resume Extracted Data:
${JSON.stringify(resumeDetail, null, 2)}
              `,
                        },
                    ],
                },
            ],
            systemInstruction: instruction,
        });

        const text = response.response.text();
        res.json({ text });
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
