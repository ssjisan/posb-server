import express from "express";
import {
  messageUpload,
  listAllMessages,
  markAllMessagesRead,
  markMessageAsRead,
} from "../controller/messageController.js";

const router = express.Router();
import { requiredSignIn } from "../middlewares/authMiddleware.js";

// Route for creating a new message
router.post("/upload-message", messageUpload);
router.get("/messages", requiredSignIn, listAllMessages);
router.put("/messages/mark-all-read", requiredSignIn, markAllMessagesRead);
router.put("/messages/:id/read", requiredSignIn, markMessageAsRead); // New route for marking a specific message as read

export default router;
