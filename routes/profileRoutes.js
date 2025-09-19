import express from "express";
import { updateProfile } from "../controllers/profileController.js";
import protect from "../middlewares/auth.js";

const router = express.Router();

router.put("/setup", protect, updateProfile);

export default router;
