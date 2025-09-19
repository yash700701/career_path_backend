import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please add a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6,
            select: false,
        },
        isVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        emailVerificationExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        age: { type: Number },
        educationLevel: { type: String },
        interests: [String], // array of strings
        preferredIndustries: [String], // array of strings
        linkedInProfile: { type: String },
        location: { type: String },
    },
    {
        timestamps: true,
    }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match user entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
