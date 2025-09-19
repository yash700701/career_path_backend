import mongoose from "mongoose";

const userProfileDataSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        personalInfo: {
            fullName: String,
            email: String,
            phone: String,
            location: String,
            summary: String, // Professional summary or about section
        },
        education: [
            {
                institution: String,
                degree: String,
                fieldOfStudy: String,
                startDate: String,
                endDate: String,
                grade: String,
            },
        ],
        experience: [
            {
                title: String,
                company: String,
                location: String,
                startDate: String,
                endDate: String,
                description: String,
            },
        ],
        skills: [String], // e.g., ["JavaScript", "React", "Data Analysis"]
        certifications: [
            {
                name: String,
                issuer: String,
                issueDate: String,
                expirationDate: String,
                credentialId: String,
                credentialUrl: String,
            },
        ],
        languages: [
            {
                name: String,
                proficiency: String,
            },
        ],
        projects: [
            {
                name: String,
                description: String,
                link: String,
            },
        ],
        socialProfiles: {
            linkedIn: String,
            github: String,
            twitter: String,
            portfolio: String,
        },
        awards: [
            {
                title: String,
                date: String,
                issuer: String,
                description: String,
            },
        ],
        interests: [String], // Extracted from LinkedIn interests or resume
        // Optionally, raw parsed data for audit or debugging
        rawResumeText: String,
        rawLinkedInData: mongoose.Schema.Types.Mixed,
    },
    {
        timestamps: true,
    }
);

const UserProfileData = mongoose.model(
    "UserProfileData",
    userProfileDataSchema
);

export default UserProfileData;
