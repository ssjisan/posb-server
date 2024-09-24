import express from "express";
const router = express.Router();
// import controller
import { createJournal,listOfJournal,readJournal,updateJournal,removeJournal } from "../controller/journalController.js";

// import middleware
import { requiredSignIn } from "../middlewares/authMiddleware.js";

router.post("/add_link", requiredSignIn, createJournal);
router.get("/links", listOfJournal);
router.get("/link/:linkId", requiredSignIn, readJournal);
router.put("/link/:linkId", requiredSignIn, updateJournal);
router.delete("/link/:linkId", removeJournal);


export default router;
