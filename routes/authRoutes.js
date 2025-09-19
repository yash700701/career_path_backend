import express from "express";
import {
    register,
    login,
    getProfile,
    resetPassword,
    resetPasswordConfirm,
    verifyEmail,
} from "../controllers/authController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.post("/reset-password", resetPassword);
router.post("/reset-password/:resetToken", resetPasswordConfirm);
router.get("/verify-email/:verificationToken", verifyEmail);

export default router;
