// routes/registrationRoutes.js
import express from "express";
import {
  createRegistration,
  getRegistrationById,
  updatePaymentInfo,
  getAllRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../controller/registrationController.js";
import { requiredSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// POST /api/registrations
router.post("/registrations", createRegistration);
router.get("/track/:registrationId", getRegistrationById);
router.put("/registration/:registrationId/payment", updatePaymentInfo);
router.get("/registrations", requiredSignIn, getAllRegistrations);
router.post("/registration/approve", requiredSignIn, approveRegistration);
router.post("/registration/reject", requiredSignIn, rejectRegistration);
export default router;
