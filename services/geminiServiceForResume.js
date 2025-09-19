import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);

export const extractDataFromPDF = async (pdfText) => {
    const instruction = `
You are an AI assistant tasked with extracting structured resume information from raw text.
Extract the following fields:
- Personal Information: full name, email, phone, location, summary
- Education
- Experience
- Skills
- Certifications
- Languages
- Projects
- Social Profiles
- Awards
- Interests

Return the result in JSON format matching the database structure.
Only include fields found in the text.
If you can't find any field, return null (example: "phone": null).

Wrap the JSON output only in \`\`\`json and \`\`\`, nothing else.

Database structure:
const userProfileDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    summary: String
  },
  education: [
    {
      institution: String,
      degree: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      grade: String
    }
  ],
  experience: [
    {
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      description: String
    }
  ],
  skills: [String],
  certifications: [
    {
      name: String,
      issuer: String,
      issueDate: String,
      expirationDate: String,
      credentialId: String,
      credentialUrl: String
    }
  ],
  languages: [
    {
      name: String,
      proficiency: String
    }
  ],
  projects: [
    {
      name: String,
      description: String,
      link: String
    }
  ],
  socialProfiles: {
    linkedIn: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  awards: [
    {
      title: String,
      date: String,
      issuer: String,
      description: String
    }
  ],
  interests: [String],
  rawResumeText: String,
  rawLinkedInData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});
`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: pdfText }] }],
        config: {
            systemInstruction: instruction,
        },
    });

    try {
        console.log("Raw AI Response:\n", response.text);

        // Clean the response by removing markdown formatting
        let cleaned = response.text.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.replace(/^```json\s*/, "");
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.replace(/\s*```$/, "");
        }

        console.log("Cleaned Response:\n", cleaned);

        return JSON.parse(cleaned);
    } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        throw new Error("Invalid response format from AI");
    }
};
