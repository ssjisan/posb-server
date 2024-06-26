import express from "express";
import {
  createAlbum,
  listOfAllAlbums,
  deleteAlbum,
  updateAlbum,
  readAlbum,
} from "../controller/albumController.js";
import multer from "multer";

const router = express.Router();
import { requiredSignIn } from "../middlewares/authMiddleware.js";

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/album",
  requiredSignIn,
  upload.array("images", 50),
  createAlbum
);
router.get("/albums", listOfAllAlbums);
router.get("/album/:slug", readAlbum);
router.delete("/album/:albumId", requiredSignIn, deleteAlbum);
router.put(
  "/album/:albumId",
  upload.array("newImages", 50),
  requiredSignIn,
  updateAlbum
);

export default router;
