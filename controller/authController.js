import jwt from "jsonwebtoken";
import { comparePassword, hashPassword } from "../helper/passwordHash.js";
import UserModel from "../model/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    // 1. destruct the element
    const { name, email, password } = req.body;
    // 2. Add Validation
    if (!name.trim()) {
      return res.json({ error: "Name is required" });
    }
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password should be longer than 6 charecter" });
    }
    // 3. Check the email is taken or not
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ error: "Email is already taken" });
    }
    // 4. Hased the password
    const hashedPassword = await hashPassword(password);
    // 5. Create User
    const newUser = await new UserModel({
      name,
      email,
      password: hashedPassword,
    }).save();
    // 6. Use JWT for auth
    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });
    // 7. Save User
    res.json({
      newUser: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
  }
};

export const loginUser = async (req, res) => {
  try {
    // 1. destruct the element
    const { email, password } = req.body;
    // 2. Add Validation
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password should be longer than 6 charecter" });
    }
    // 3. Check the email is taken or not
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not Found" });
    }
    // 4. Hased the password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Password wrong" });
    }

    // 5. Use JWT for auth
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });
    // 6. Save User
    res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err);
  }
};

export const userList = async (req, res) => {
  try {
    const user = await UserModel.find({});
    res.json(user);
  } catch (err) {
    console.log(err.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    // 1. destruct the element
    const { email, password } = req.body;
    // 2. Add Validation
    if (!email) {
      return res.json({ error: "Email is required" });
    }
    if (!password || password.length < 6) {
      return res.json({ error: "Password should be longer than 6 charecter" });
    }
    // 3. Check the email is taken or not
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not Found" });
    }
    // 4. Hased the password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.json({ error: "Password wrong" });
    }

    // 5. Use JWT for auth
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECURE, {
      expiresIn: "7d",
    });
    // 6. Save User
    res.json({
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const removeUser = async (req, res) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.userId);
    res.json(user);
  } catch (err) {
    return res.status(400).json(err);
  }
};
export const privateRoute = async (req, res) => {
  res.json({ currentUser: req.user });
};
