import express from "express";
import {
    answerQuestion,
    createQuiz,
    quizHandler,
    returnQuestionAnswers,
} from "../controllers/quizController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/:quizId/answer", protect, answerQuestion);
router.post("/create-quiz", protect, createQuiz);
router.post("/quiz-handler", protect, quizHandler);
router.get("/return-quiz", protect, returnQuestionAnswers);

export default router;
