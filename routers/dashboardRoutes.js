// routes/dashboardRoutes.js
import express from "express";
import { getDashboardData } from "../controller/dashboardController.js";
const router = express.Router();
import { requiredSignIn } from "../middlewares/authMiddleware.js";

router.get("/dashboard-data", requiredSignIn, getDashboardData);

export default router;
