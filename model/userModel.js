import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
    },
    original_password: {
      type: String,
    },
    bio: {
      type: String,
    },
    role: {
      type: String,
      enum: ["member", "admin"],
      default: "member",
    },
    image: {
      type: String,
    },
    imageId: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false }
);

export const User = mongoose.model("User", userSchema);
