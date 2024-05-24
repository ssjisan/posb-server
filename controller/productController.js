import slugify from "slugify";
import Products from "../model/productModel.js";
import fs from "fs";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, sold, shipping } =
      req.fields;
    const { image } = req.files;
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !price.trim():
        return res.json({ error: "Price is required" });
      case !category.trim():
        return res.json({ error: "Category is required" });
      case !quantity.trim():
        return res.json({ error: "Quantity is required" });
      case !sold.trim():
        return res.json({ error: "Sold is required" });
      case !shipping.trim():
        return res.json({ error: "Shipping is required" });
      case image && image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }
    const product = new Products({ ...req.fields, slug: slugify(name) });
    if (image) {
      product.image.data = fs.readFileSync(image.path);
      product.image.contentType = image.type;
    }
    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};

export const listProduct = async (req, res) => {
  try {
    const product = await Products.find({})
      .select("-image")
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const readProduct = async (req, res) => {
  try {
    const product = await Products.findOne({ slug: req.params.slug })
      .select("-image")
      .populate("category");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const imageOfProduct = async (req, res) => {
  try {
    const product = await Products.findById(req.params.productId).select(
      "image"
    );
    if (product.image.data) {
      res.set("Content-Type", product.image.contentType);
      return res.send(product.image.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const removeProduct = async (req, res) => {
  try {
    const product = await Products.findByIdAndDelete(req.params.productId);
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, quantity, sold, shipping } =
      req.fields;
    const { image } = req.files;
    switch (true) {
      case !name.trim():
        res.json({ error: "Name is required" });
      case !description.trim():
        res.json({ error: "Description is required" });
      case !price.trim():
        res.json({ error: "Price is required" });
      case !category.trim():
        res.json({ error: "Category is required" });
      case !quantity.trim():
        res.json({ error: "Quantity is required" });
      case !sold.trim():
        res.json({ error: "Sold is required" });
      case !shipping.trim():
        res.json({ error: "Shipping is required" });
      case image && image.size > 1000000:
        res.json({ error: "Image size should not be more than 1MB" });
    }
    const product = await Products.findByIdAndUpdate(req.params.productId, {
      ...req.fields,
      slug: slugify(name),
    });
    if (image) {
      product.image.data = fs.readFileSync(image.path);
      product.image.contentType = image.type;
    }
    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};
