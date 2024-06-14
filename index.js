import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routers/authRoutes.js";
import eventRoutes from "./routers/eventRoutes.js";
import albumRoutes from "./routers/albumRoutes.js";
import noticeRoutes from "./routers/noticeRoutes.js";
import memberRoutes from "./routers/memberRoutes.js"
import executiveBodyRoutes from "./routers/executiveBodyRoutes.js"

import morgan from "morgan";
import cors from "cors";

dotenv.config();

const app = express();

// connect database //
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// middelwares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// router middelware //
app.use(authRoutes);
app.use(eventRoutes);
app.use(albumRoutes);
app.use(noticeRoutes);
app.use(memberRoutes);
app.use(executiveBodyRoutes);

const port = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.send("Hi!!! Your are getting data");
});

app.listen(port, () => {
  console.log(`This is running ${port}`);
});
