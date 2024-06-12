import express from "express";
const router = express.Router();
// import controller
import {
  createNotice,
  listOfNotice,
  readNotice,
  removeNotice,
  updateNotice,
} from "../controller/noticeController.js";

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";

router.post("/notice", requiredSignIn, createNotice);
router.get("/notices", listOfNotice);
router.get("/notice/:noticeId", readNotice);
router.delete("/notice/:noticeId", requiredSignIn, removeNotice);
router.put("/notice/:noticeId", requiredSignIn,updateNotice);

export default router;
