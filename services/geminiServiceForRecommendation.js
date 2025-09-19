import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);

export const generateCareerRecommendation = async ({
    userProfile,
    QuizAnswers,
    ResumeData,
}) => {
    console.log("data recieved for generate career recommendation:", {
        userProfile,
        QuizAnswers,
        ResumeData,
    });
    const instruction = `
You are an expert career advisor and data-driven recommendation engine. Based on the following inputs:

1. User's profile details including name, skills, experience, education, location, and other relevant information extracted from their resume.
2. A set of 10 personalized answers provided by the user through questionnaires or assessments that describe their interests, strengths, learning preferences, and career aspirations.

Your task is to generate a structured career recommendation output in JSON format according to the following Mongoose schema structure:

---
import mongoose from 'mongoose';

const learningResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  type: { type: String, required: true }
}, { _id: false });

const recommendedCareerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  industry: { type: String, required: true },
  matchScore: { type: Number, required: true },
  whyRecommended: { type: String, required: true },
  requiredSkills: [{ type: String, required: true }],
  averagePackage: { type: String, required: true },
  futureScope: { type: String, required: true },
  learningResources: [learningResourceSchema],
  roadmap: [{ type: String }]
}, { _id: false });

const careerRecommendationSchema = new mongoose.Schema({
  recommendedCareers: [recommendedCareerSchema],
  summary: { type: String }
}, {
  timestamps: true
});

const CareerRecommendation = mongoose.model('CareerRecommendation', careerRecommendationSchema);

export default CareerRecommendation;
---

⚙️ Requirements:
- Provide at least 3 recommended careers tailored to the user's profile and preferences.
- For each recommended career, calculate a matchScore (0-100) based on how well it fits the user's skills and interests.
- Include whyRecommended with a personalized explanation.
- List requiredSkills relevant to that career.
- Suggest realistic averagePackage for the career in the user's region or typical market.
- Provide futureScope describing trends, growth potential, or emerging technologies.
- Add 3–5 learningResources with name, link, and type (e.g., Online Course, Book, Project).
- Suggest nextSteps that the user can start immediately.
- Provide a roadmap as an ordered array of action points that guide the user step by step from their current profile to achieving the career goal.

📦 Deliver the final output as a JSON object structured exactly according to the schema provided, without extra comments or explanation.

Here is the user’s input data:
user Profile -> ${userProfile}
resume extracted data -> ${ResumeData}
quiz data -> ${QuizAnswers}

Generate the best career roadmap recommendations based on this data.

`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: "Generate the best career roadmap recommendations based on this data.",
                    },
                ],
            },
        ],
        config: {
            systemInstruction: instruction,
        },
    });

    try {
        // Clean the response by removing markdown formatting
        let cleaned = response.text.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "");
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.replace(/\s*```$/, "");
        }

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        throw new Error("Invalid response format from AI");
    }
};
