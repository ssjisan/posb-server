import express from "express";
import formidable from "express-formidable";
import multer from "multer";

const router = express.Router();
// import controller
import {
  createAlbum,
  readAlbum,
  listAlbums,
  removeAlbum
} from "../controller/albumController.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

const upload = multer({ dest: "uploads/" });

router.post(
  "/album",
  requiredSignIn,
  isAdmin,
  upload.array("images", 10),
  createAlbum
);
router.get("/album/:slug", readAlbum);
router.get("/albums", listAlbums);
// router.put(
//   "/event/:eventId",
//   requiredSignIn,
//   isAdmin,
//   formidable(),
//   updateEvent
// );
// router.delete("/album/:albumId", requiredSignIn, isAdmin, removeAlbum);

export default router;
