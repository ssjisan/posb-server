import express from "express";
import multer from "multer";

const router = express.Router();
// import controller
import {
  createEvent,
  getFilteredEvents,
  updateEventsSequence,
  deleteEvent,
  // readEvent,
  // removeEvent,
  // activeEvents
} from "../controller/eventController.js";

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route to create a new doctor profile
router.post(
  "/create-event",
  requiredSignIn,
  upload.single("coverPhoto"),
  createEvent
);
router.get("/events", getFilteredEvents);
router.post("/update-event-order", requiredSignIn, updateEventsSequence);
router.delete("/events/:eventId", requiredSignIn, deleteEvent);


export default router;
