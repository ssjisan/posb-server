import express from "express";
const router = express.Router();
// import controller
import { createNotice,listOfNotice } from "../controller/noticeController.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

router.post("/notice", requiredSignIn, isAdmin, createNotice);
router.get("/notices", listOfNotice);

export default router;
