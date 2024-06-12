import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Members from "../model/memberModel.js";

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
    const stream = cloudinary.uploader.upload_stream((error, result) => {
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

export const createMember = async (req, res) => {
  try {
    const { name, designation, workPlace, email, phone, mailingAddress } =
      req.body;
    const profilePhoto = req.file;

    // Upload the profile photo to Cloudinary
    let uploadedImage = null;
    if (profilePhoto) {
      uploadedImage = await uploadImageToCloudinary(profilePhoto.buffer);
    }

    // Validate required fields
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !designation.trim():
        return res.json({ error: "Designation is required" });
      case !workPlace.trim():
        return res.json({ error: "Workplace is required" });
      case !email.trim():
        return res.json({ error: "Email is required" });
      case !phone.trim():
        return res.json({ error: "Phone is required" });
      case !mailingAddress.trim():
        return res.json({ error: "Mailing Address is required" });
    }

    // Create a new member document
    const member = new Members({
      name,
      designation,
      workPlace,
      email,
      phone,
      mailingAddress,
      profilePhoto: uploadedImage ? [uploadedImage] : [], // Store the uploaded image data
    });

    // Save the member to the database
    await member.save();

    // Send the created member as a response
    res.status(201).json(member);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const listAllMembers = async (req, res) => {
  try {
    const members = await Members.find();
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const member = await Members.findByIdAndDelete(memberId);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Delete profile photo from Cloudinary
    if (member.profilePhoto && member.profilePhoto.length > 0) {
      try {
        const publicId = member.profilePhoto[0].public_id;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        res.json({ message: error.message });
      }
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
