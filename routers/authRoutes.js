import express from "express";
const router = express.Router();

// import controller
import {
  registerUser,
  loginUser,
  privateRoute,
  removeUser,
  userList,
} from "../controller/authController.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", requiredSignIn, isAdmin, userList);
router.delete("/user/:userId", requiredSignIn, isAdmin, removeUser);
router.get("/private", requiredSignIn, isAdmin, privateRoute);
router.get("/auth-check", requiredSignIn, (req, res) => {
  res.json({ ok: true });
});

export default router;
