import User from "../models/User.js";

/**
 * @desc    Update user profile after signup
 * @route   PUT /api/profile/setup
 * @access  Private
 */
export const updateProfile = async (req, res) => {
    try {
        const {
            age,
            educationLevel,
            interests,
            preferredIndustries,
            linkedInProfile,
            location,
        } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.age = age || user.age;
        user.educationLevel = educationLevel || user.educationLevel;
        user.interests = interests || user.interests;
        user.preferredIndustries =
            preferredIndustries || user.preferredIndustries;
        user.linkedInProfile = linkedInProfile || user.linkedInProfile;
        user.location = location || user.location;

        await user.save();

        return res.json({
            message: "Profile updated successfully",
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                age: user.age,
                educationLevel: user.educationLevel,
                interests: user.interests,
                preferredIndustries: user.preferredIndustries,
                linkedInProfile: user.linkedInProfile,
                location: user.location,
            },
        });
    } catch (error) {
        console.error("Profile Setup Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
