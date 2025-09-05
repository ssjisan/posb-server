// routes/registrationRoutes.js
import express from "express";
import { createRegistration } from "../controller/registrationController.js";

const router = express.Router();

// POST /api/registrations
router.post("/registrations", createRegistration);

export default router;
