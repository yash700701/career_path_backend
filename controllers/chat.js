import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @desc    Generate personalized response
 * @route   POST /api/chat/chat-handler
 * @access  Private
 */
export const generateResponse = async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not set in .env");
            return res.status(500).json({ error: "Server misconfiguration" });
        }

        const { history, userDetail, resumeDetail, quizDetail, input } =
            req.body;
        if (!history || !userDetail || !resumeDetail || !input || !quizDetail) {
            return res.status(400).json({ error: "Missing required data" });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const instruction = `
You are a Personalized Career and Skills Advisor chatbot. 
Your role is to help the user explore career paths, analyze their profile, resume, and quiz responses, and provide personalized guidance.

🎯 Guidelines:
1. Always interpret the user's query in the context of their career goals, skills, education, location, and preferences.
2. If the query is unrelated to careers, politely redirect them back to career-related discussions.
3. Use the given user profile, resume details, and quiz responses to make recommendations that are specific, personalized, and actionable.
4. Suggest relevant career paths, required skills, certifications, courses, or roadmaps where applicable.
5. When giving advice, be supportive, concise, and easy to understand.
6. Break down answers into structured points, bullet lists, or step-by-step guidance for clarity.
7. If there are multiple possible paths, present options with pros and cons.
8. Never invent unrealistic information — base your answers on provided details + general career knowledge.
9. Encourage the user to explore skills or opportunities that align with their background and interests.
10. dont give too long and irrelevent answers.

Your tone: Professional, encouraging, and mentor-like.
Your output: Career-focused, practical, and aligned with the user's data.
`;

        const response = await model.generateContent({
            contents: [
                ...history,
                {
                    role: "user",
                    parts: [
                        {
                            text: `
                                Please generate the response of the user query based on the following student profile:

                                📌 User Query: question asked by user
                                ${input}

                                📌 User Profile:
                                ${JSON.stringify(userDetail, null, 2)}

                                📌 Resume Extracted Data:
                                ${JSON.stringify(resumeDetail, null, 2)}
                                
                                📌 Quiz Extracted Data:
                                ${JSON.stringify(quizDetail, null, 2)}
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
        console.error("Error in /api/chat/chat-handler:", error);
        res.status(500).json({ error: "Failed to process request" });
    }
};
