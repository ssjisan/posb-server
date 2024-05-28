import express from "express";
import formidable from "express-formidable";
const router = express.Router();
// import controller
import { createEvent, updateEvent,listEvents,imageOfEvent,readEvent } from "../controller/eventController.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

router.post("/event", requiredSignIn, isAdmin, formidable(), createEvent);
router.put( "/event/:eventId",  requiredSignIn,  isAdmin,  formidable(),  updateEvent);
router.get("/events", listEvents);
router.get("/event/image/:eventId", imageOfEvent);
router.get("/event/:slug", readEvent);
// router.delete("/products/:productId", requiredSignIn, isAdmin, removeProduct);

export default router;
