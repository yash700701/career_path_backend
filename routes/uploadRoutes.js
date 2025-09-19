import express from "express";
import {
    uploadResume,
    getResumeDetail,
} from "../controllers/extractDataController.js";
import protect from "../middlewares/auth.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/upload-resume", protect, upload.single("resume"), uploadResume);
router.get("/get-resume", protect, getResumeDetail);

export default router;
