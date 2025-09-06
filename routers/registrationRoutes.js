// routes/registrationRoutes.js
import express from "express";
import {
  createRegistration,
  getRegistrationById,
  updatePaymentInfo,
  getAllRegistrations,
} from "../controller/registrationController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/registrations
router.post("/registrations", createRegistration);
router.get("/track/:registrationId", getRegistrationById);
router.put("/registration/:registrationId/payment", updatePaymentInfo);
router.get("/registrations", requiredSignIn, getAllRegistrations);

export default router;
