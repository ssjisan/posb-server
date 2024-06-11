import express from "express";
import { createMember,listAllMembers } from "../controller/memberController.js";
import multer from "multer";

const router = express.Router();
import { requiredSignIn } from "../middlewares/authMiddleware.js";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/add-member",
  requiredSignIn,
  upload.single("profilePhoto"), // change to single image upload
  createMember
);
router.get("/members",requiredSignIn, listAllMembers);

export default router;
