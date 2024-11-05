import express from "express";
import formidable from "express-formidable";
const router = express.Router();
// import controller
import {
  createEvent,
  updateEvent,
  listEvents,
  imageOfEvent,
  readEvent,
  removeEvent,
} from "../controller/eventController.js";

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";

router.post("/event", requiredSignIn, formidable(), createEvent);
router.put(
  "/event/:eventId",
  requiredSignIn,
  formidable(),
  updateEvent
);
router.get("/events",requiredSignIn, listEvents);
router.get("/event/image/:eventId", imageOfEvent);
router.get("/event/:slug", readEvent);
router.delete("/event/:eventId", requiredSignIn, removeEvent);

export default router;
