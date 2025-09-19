import CareerRecommendation from "../models/careerRecomendation.js";
import { generateCareerRecommendation } from "../services/geminiServiceForRecommendation.js";

/**
 * @desc    Generate career recommendation and save it to DB
 * @route   POST /api/career/generateRecommendation
 * @access  Private
 */
export const generateRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;
        const userProfile = req.body.userProfile;
        const QuizAnswers = req.body.QuizAnswers;
        const ResumeData = req.body.ResumeData;

        const extractedData = await generateCareerRecommendation({
            userProfile,
            QuizAnswers,
            ResumeData,
        });

        console.log(
            "gemini response on generateCareerRecommendation:",
            extractedData
        );

        const recommendedCareers = extractedData.recommendedCareers || [];
        const summary = extractedData.summary || "";

        const profile = await CareerRecommendation.findOneAndUpdate(
            { userId: userId },
            { userId, recommendedCareers, summary }, // ✅ properly shaped object
            { upsert: true, new: true }
        );

        res.json({
            message: "Career recommendation generated successfully.",
            profile,
        });
    } catch (error) {
        console.error("Career recommendation generated error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Fetch career recommendation from DB
 * @route   GET /api/career/get-generatedRecommendation
 * @access  Private
 */
export const getGeneratedRecommendation = async (req, res) => {
    try {
        const userId = req.user.id;

        const profile = await CareerRecommendation.findOne({ userId: userId });

        res.json({
            message: "Get Career recommendation successfully.",
            profile,
        });
    } catch (error) {
        console.error("Get Career recommendation error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
