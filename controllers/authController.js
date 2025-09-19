import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let user = await User.findOne({ email });

        if (user) {
            if (!user.isVerified && user.emailVerificationExpire < Date.now()) {
                await User.deleteOne({ email }); // Or you can update the record instead
            } else {
                return res.status(400).json({ message: "User already exists" });
            }
        }

        user = await User.create({ name, email, password, isVerified: false });

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        user.emailVerificationToken = verificationTokenHash;
        user.emailVerificationExpire = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
        const message = `Verify your email by clicking the link below:\n\n${verificationUrl}`;

        await sendEmail({
            to: user.email,
            subject: "Email Verification",
            html: `
                <p>Hello ${user.name},</p>
                <p>${message}</p>
            `,
        });

        return res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            message: "Verification email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("Register Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Verify email address
 * @route   GET /api/auth/verify-email/:verificationToken
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
    try {
        const { verificationToken } = req.params;
        const verificationTokenHash = crypto
            .createHash("sha256")
            .update(verificationToken)
            .digest("hex");

        const user = await User.findOne({
            emailVerificationToken: verificationTokenHash,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired token" });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        return res.json({
            message: "Email verified successfully. You can now login.",
        });
    } catch (error) {
        console.error("Email Verification Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.isVerified) {
            return res
                .status(403)
                .json({ message: "Please verify your email to login" });
        }

        if (await user.matchPassword(password)) {
            return res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            return res.json({
                user,
            });
        } else {
            return res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Profile Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Initiate password reset
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No user found with that email" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour

        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `You requested a password reset. Please click on the link below to reset your password:\n\n${resetUrl}`;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <p>Hello ${user.name},</p>
                <p>${message}</p>
            `,
        });

        return res.json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:resetToken
 * @access  Public
 */
export const resetPasswordConfirm = async (req, res) => {
    try {
        const { resetToken } = req.params;
        const { password } = req.body;

        const resetTokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired token" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.json({ message: "Password has been reset successfully" });
    } catch (error) {
        console.error("Reset Password Confirm Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};
