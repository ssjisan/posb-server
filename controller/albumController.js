import slugify from "slugify";
import Albums from "../model/albumModel.js";
import {v2 as cloudinary} from 'cloudinary';
dotenv.config();

const CLOUD_NAME = process.env.CLOUD_NAME;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const uploadImageToCloudinary = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    });
    stream.end(imageBuffer);
  });
};

export const createAlbum = async (req, res) => {
  try {
    const { name } = req.body;
    const images = req.files;
    const uploadedImages = [];

    // Upload each image to Cloudinary and store the result in uploadedImages
    for (const image of images) {
      const uploadResult = await uploadImageToCloudinary(image.buffer);
      uploadedImages.push(uploadResult);
    }

    // Create a new album document
    const album = new Albums({
      name,
      slug: slugify(name, { lower: true }),
      images: uploadedImages,
    });

    // Save the album to the database
    await album.save();

    // Send the created album as a response
    res.status(201).json(album);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const listOfAllAlbums = async (req, res) => {
  try {
    // Fetch all albums from the database
    const albums = await Albums.find();

    // Return the list of albums as a JSON response
    res.status(200).json(albums);
  } catch (err) {
    console.error("Error fetching albums:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const readAlbum = async (req, res) => {
  try {
    const { slug } = req.params;
    const album = await Albums.findOne({ slug });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }
    res.json(album);
  } catch (error) {
    console.error("Error fetching album:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;

    // Find the album by id
    const album = await Albums.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Delete images from Cloudinary
    for (const image of album.images) {
      try {
        await cloudinary.v2.uploader.destroy(image.public_id);
      } catch (error) {
        console.error(`Error deleting image from Cloudinary: ${error.message}`);
      }
    }

    // Delete album from database
    await Albums.findByIdAndDelete(albumId);

    res
      .status(200)
      .json({ message: "Album and its images deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { name } = req.body;
    const removeImageIds = req.body.removeImageIds ? JSON.parse(req.body.removeImageIds) : []; // Parse JSON string
    const newImages = req.files;
    const albumId = req.params.albumId;

    // Find the album by id
    const album = await Albums.findById(albumId);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Update album name if provided
    if (name) {
      album.name = name;
      album.slug = slugify(name, { lower: true });
    }

    // Remove selected images from Cloudinary and album
    if (removeImageIds && removeImageIds.length > 0) {
      for (const public_id of removeImageIds) {
        // Remove image from Cloudinary
        await cloudinary.v2.uploader.destroy(public_id);
        // Remove image from album
        album.images = album.images.filter(image => image.public_id !== public_id);
      }
    }


   // Upload new images to Cloudinary and add to album
   if (newImages && newImages.length > 0) {
    for (const image of newImages) {
      const uploadResult = await uploadImageToCloudinary(image.buffer);
      if (!uploadResult) {
        throw new Error("Failed to upload image to Cloudinary");
      }
      album.images.push({
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      });
    }
  }
  
    // Save the updated album
    await album.save();

    // Send the updated album as a response
    res.status(200).json(album);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
