import express from "express";


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


router.post(
  "/album",
  requiredSignIn,
  isAdmin,
  createAlbum
);
router.get("/album/:slug", readAlbum);
router.get("/albums", listAlbums);
router.delete("/album/:albumId", requiredSignIn, isAdmin, removeAlbum);
// router.put(
//   "/event/:eventId",
//   requiredSignIn,
//   isAdmin,
//   formidable(),
//   updateEvent
// );

export default router;