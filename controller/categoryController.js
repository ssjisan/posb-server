import slugify from "slugify";
import Category from "../model/categoryModel.js";

// Create Category

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.json({ error: "Sorry! This category already exists" });
    }
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Update Category

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(category);
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Remove Category

export const removeCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    res.json(category);
  } catch (err) {
    return res.status(400).json(err);
  }
};

// List Category

export const listCategory = async (req, res) => {
  try {
    const category = await Category.find({});
    res.json(category);
  } catch (err) {
    return res.status(400).json(err);
  }
};

// Read Category

export const readCategory = async (req, res) => {
  try {
    const category = await Category.findOne({slug: req.params.slug});
    res.json(category);
  } catch (err) {
    return res.status(400).json(err.message);
  }
};
