import express from "express";
const router = express.Router();

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { createExecutiveBody,listExecutiveCommittee,deleteCommittee } from "../controller/executiveBodyController.js";

router.post("/create-committee", requiredSignIn, createExecutiveBody);
router.get('/executive-committee', listExecutiveCommittee);
router.delete('/executive-committee/:committeeId',requiredSignIn, deleteCommittee);

export default router;
