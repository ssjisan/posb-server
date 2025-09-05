import express from "express";
import multer from "multer";

const router = express.Router();
// import controller
import {
  getFilteredEvents,
  updateEventsSequence,
  deleteEvent,
  readEvent,
  updateEvent,
  getLatestEvent,
  getActiveEvents,
  eventGeneration
} from "../controller/eventController.js";

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/create-event",
  requiredSignIn,
  upload.single("coverPhoto"),
  eventGeneration
);
router.put(
  "/update-event/:eventId",
  requiredSignIn,
  upload.single("coverPhoto"),
  eventGeneration
);

router.get("/events", getFilteredEvents);
router.post("/update-event-order", requiredSignIn, updateEventsSequence);
router.delete("/events/:eventId", requiredSignIn, deleteEvent);
router.get("/events/:eventId", readEvent);
router.put("/event/:eventId", requiredSignIn,upload.single("coverPhoto"), updateEvent);
router.get("/latest-event", getLatestEvent);
router.get("/events-by-status", getActiveEvents);

export default router;
