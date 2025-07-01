import { User } from "../model/userModel.js";
import cloudinary from "../utils/cloudinary.js";

import {
  hashedPasswordCompare,
  hashedPasswordHandler,
} from "../utils/hashedPassword.js";
import createJsonWebToken from "../utils/jsonWebToken.js";

// @desc Register user
// @route POST /api/auth/register
// @access Public
const userRegister = async (req, res) => {
  try {
    const { name, email, password, bio, adminAccessToken } = req.body;
    const authorImage = req.files ? req.files.image : null;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(406).json({ message: "Email already used" });
    }
    const hashedPassword = await hashedPasswordHandler(password);

    let role = "member";

    if (
      adminAccessToken &&
      adminAccessToken == process.env.ADMIN_ACCESS_TOKEN
    ) {
      role = "admin";
    }

    let imageUrl = null;
    let imageId = null;

    if (authorImage) {
      // Delete image from cloudinary
      if (existingUser?.imageId) {
        await cloudinary.uploader.destroy(existingUser?.imageId);
      }

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(authorImage.tempFilePath);
      (imageUrl = result.secure_url), (imageId = result.public_id);
    }

    // Retain the existing avatar values if no new avatar is selected
    if (!imageUrl && existingUser) {
      imageUrl = existingUser.image;
      imageId = existingUser.imageId;
    }

    const user = new User({
      name,
      email,
      role,
      bio,
      imageId,
      image: imageUrl,
      password: hashedPassword,
      original_password: password,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User register successfully",
    });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
      return res.status(400).json({ message: "You are not registered user" });
    }

    const user = await hashedPasswordCompare(password, foundUser.password);

    if (user) {
      const token = await createJsonWebToken({
        email: foundUser.email,
        id: foundUser._id,
        isAdmin: foundUser.role === "admin",
      });
      res
        .status(200)
        .json({ success: true, message: "Login Successful", token: token });
    } else {
      res.status(400).json({
        success: false,
        message: "Password invalid, Use the correct password",
      });
    }
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById({
      _id: req.user.id,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Success",
      user: {
        name: user.name,
        email: user.email,
        bio: user.bio,
        role: user.role,
        image: user.image,
        id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

// Exporting the functions to be used in routes
export { getUserProfile, userLogin, userRegister };
