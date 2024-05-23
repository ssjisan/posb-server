import express from "express";
const router = express.Router();

// import controller
import { registerUser, loginUser, privateRoute } from "../controller/auth.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/auth.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/private", requiredSignIn, isAdmin, privateRoute);
router.get("/auth-check", requiredSignIn, (req, res) => {
  res.json({ ok: true });
});

export default router;
