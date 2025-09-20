import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(apiKey);

export const generateCareerRecommendation = async ({
  userProfile,
  QuizAnswers,
  ResumeData,
}) => {
  console.log("data received for generate career recommendation:", {
    userProfile,
    QuizAnswers,
    ResumeData,
  });

  const instruction = `
You are an expert career advisor and data-driven recommendation engine. 
Your task is to generate a structured career recommendation output in JSON format according to the following schema:

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
- For each career, calculate a matchScore (0-100).
- Include whyRecommended with a personalized explanation.
- List requiredSkills relevant to that career.
- Suggest realistic averagePackage for the career in the user's region or typical market.
- Provide futureScope describing trends, growth potential, or emerging technologies.
- Add 3–5 learningResources with name, link, and type (Online Course, Book, Project, etc.).
- Provide a roadmap as an ordered array of next steps.
- start summary in you tone (eg: Yash you are a highly talented undergraduate not Yash is a highly talented undergraduate)

📦 Deliver the final output as **valid JSON only**, no comments or explanations.
  `;

  const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const response = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
${instruction}

Here is the user’s input data:

User Profile:
${JSON.stringify(userProfile, null, 2)}

Resume Extracted Data:
${JSON.stringify(ResumeData, null, 2)}

Quiz Answers:
${JSON.stringify(QuizAnswers, null, 2)}
            `,
          },
        ],
      },
    ],
  });

  try {
    // ✅ Correct way to extract text
    let cleaned = response.response.text().trim();

    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "");
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.replace(/\s*```$/, "");
    }

    return JSON.parse(cleaned);
  } catch (error) {
    console.error(
      "Failed to parse Gemini response:",
      error,
      response.response.text()
    );
    throw new Error("Invalid response format from AI");
  }
};
