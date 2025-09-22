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
You are a Personalized Career Advisor AI.

Your task:
- Always give concise, direct, and clear answers to the user’s query. 
- Avoid repeating the full user profile, resume, or achievements unless directly relevant.
- Use the profile, resume, and quiz data only as context to tailor your answer, not as the main content of every response.
- Never generate long, essay-style answers. Stick to a maximum of 3–5 short bullet points or a short paragraph.
- Stay focused on the user’s actual question (career-related only). 
- If asked about skills, jobs, or career paths, highlight the most relevant items from their profile instead of listing everything.
- Mention achievements ONLY if they strengthen the answer (e.g., “Yes, your IconKit project shows strong AI integration skills, which employers value”).
- Keep the tone professional, supportive, and motivating.
- Do not re-introduce yourself on every reply.

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
