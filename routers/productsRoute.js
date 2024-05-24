import express from "express";
import formidable from "express-formidable";
const router = express.Router();
// import controller
import {
  createProduct,
  listProduct,
  readProduct,
  imageOfProduct,
  removeProduct,
  updateProduct
} from "../controller/productController.js";

// import middleware
import { requiredSignIn, isAdmin } from "../middlewares/authMiddleware.js";

router.post("/products", requiredSignIn, isAdmin, formidable(), createProduct);
router.get("/products", listProduct);
router.get("/product/:slug", readProduct);
router.get("/product/image/:productId", imageOfProduct);
router.delete("/products/:productId", requiredSignIn, isAdmin, removeProduct);
router.put("/products/:productId", requiredSignIn, isAdmin, formidable(), updateProduct);


export default router;
