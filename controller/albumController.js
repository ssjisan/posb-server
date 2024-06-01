import { dirname } from "path";
import { fileURLToPath } from "url";
import slugify from "slugify";
import Album from "../model/albumModel.js";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import FormData from "form-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMGBB_API_KEY = "750f30021cd9d12d41a19a051df5c92a";

export const createAlbum = async (req, res) => {
  try {
    const { albumName } = req.body;
    const files = req.files;
    if (!albumName) {
      return res.status(400).json({ error: "Album name is required" });
    }

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "At least one image is required" });
    }

    const uploadedImages = [];

    for (const file of files) {
      const filePath = path.join(__dirname, "..", file.path);
      const formData = new FormData();
      formData.append("image", fs.createReadStream(filePath));
      formData.append("key", IMGBB_API_KEY);

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error("Image upload failed");
      }

      uploadedImages.push(data.data.url);
      fs.unlinkSync(filePath); // Remove file after upload
    }

    const newAlbum = new Album({
      name: albumName,
      slug: slugify(albumName, { lower: true, strict: true }),
      images: uploadedImages,
    });

    await newAlbum.save();
    res.json(newAlbum);
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const listAlbums = async (req, res) => {
  try {
    const albums = await Album.find();
    res.json(albums);
  } catch (error) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const readAlbum = async (req, res) => {
  try {
    const { slug } = req.params;
    const album = await Album.findOne({ slug });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    res.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeAlbum = async (req, res) => {
  try {
    const album = await Album.findByIdAndDelete(req.params.albumId);
    res.json(album);
  } catch (err) {
    console.log(err.message);
  }
};