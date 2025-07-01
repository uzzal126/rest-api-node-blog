import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    publishedAt: {
      type: Date,
      default: "",
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      default: null,
    },
    imageId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

export const Blog = mongoose.model("Blog", blogSchema);
