import express from "express";
import { health } from "../controllers/healthController.js";

const router = express.Router();

router.get("/", health);

export default router;
