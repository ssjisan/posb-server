import express from "express";
const router = express.Router();
// import controller
import {
  getContactInfo,
  UpdateContactInfo,
} from "../controller/contactInfoController.js";

// Routes
router.get("/contact-info", getContactInfo);
router.post("/contact-info", UpdateContactInfo);

export default router;
