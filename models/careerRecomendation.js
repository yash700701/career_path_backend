import mongoose from "mongoose";

const learningResourceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        link: { type: String, required: true },
        type: { type: String, required: true },
    },
    { _id: false }
);

const recommendedCareerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        industry: { type: String, required: true },
        matchScore: { type: Number, required: true },
        whyRecommended: { type: String, required: true },
        requiredSkills: [{ type: String, required: true }],
        averagePackage: { type: String, required: true },
        futureScope: { type: String, required: true },
        learningResources: [learningResourceSchema],
        roadmap: [{ type: String }],
    },
    { _id: false }
);

const careerRecommendationSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        recommendedCareers: [recommendedCareerSchema],
        summary: { type: String },
    },
    {
        timestamps: true,
    }
);

const CareerRecommendation = mongoose.model(
    "CareerRecommendation",
    careerRecommendationSchema
);

export default CareerRecommendation;
