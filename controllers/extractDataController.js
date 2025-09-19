import UserProfileData from "../models/FetchedInfo.js";
import fs from "fs";
import PDFParser from "pdf2json";
import { extractDataFromPDF } from "../services/geminiServiceForResume.js";

/**
 * @desc    Fetch details from resume and store in DB
 * @route   POST /api/upload/upload-resume
 * @access  Private
 */
export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const userId = req.user.id;
        const filePath = req.file.path;

        const pdfParser = new PDFParser();

        const pdfText = await new Promise((resolve, reject) => {
            pdfParser.on("pdfParser_dataError", (err) =>
                reject(err.parserError)
            );
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                let fullText = "";
                if (pdfData && pdfData.Pages) {
                    pdfData.Pages.forEach((page) => {
                        if (page.Texts) {
                            page.Texts.forEach((textObj) => {
                                const text = decodeURIComponent(
                                    textObj.R.map((r) => r.T).join("")
                                );
                                fullText += text + " ";
                            });
                        }
                    });
                }
                resolve(fullText.trim());
            });

            pdfParser.loadPDF(filePath);
        });

        const extractedData = await extractDataFromPDF(pdfText);

        const profileData = {
            user: userId,
            personalInfo: extractedData.personalInfo || {},
            education: extractedData.education || [],
            experience: extractedData.experience || [],
            skills: extractedData.skills || [],
            certifications: extractedData.certifications || [],
            languages: extractedData.languages || [],
            projects: extractedData.projects || [],
            socialProfiles: extractedData.socialProfiles || {},
            awards: extractedData.awards || [],
            interests: extractedData.interests || [],
            rawResumeText: pdfText,
            rawLinkedInData: extractedData.rawLinkedInData || {},
        };

        const profile = await UserProfileData.findOneAndUpdate(
            { user: userId },
            profileData,
            { upsert: true, new: true }
        );

        fs.unlink(filePath, (err) => {
            if (err) console.error("File cleanup error:", err);
        });

        res.json({
            message: "Resume uploaded and processed successfully.",
            profile,
        });
    } catch (error) {
        console.error("Upload resume error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Fetch resume details from DB
 * @route   GET /api/upload/get-resume
 * @access  Private
 */
export const getResumeDetail = async (req, res) => {
    try {
        const userId = req.user.id;

        const data = await UserProfileData.findOne({ user: userId });
        res.json({
            message: "Resume detail fetched successfully",
            data,
        });
    } catch (error) {
        console.error("resume fetch detail error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
