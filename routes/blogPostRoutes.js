import express from "express";
const router = express.Router();
import { isAuthenticated } from "../middlewares/authMiddleware.js";

import {
  createBlogPost,
  getBlogPosts,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  getBlogPostsByAuthor,
} from "../controllers/blogPostController.js";

router.post("/create", isAuthenticated, createBlogPost); // Create a new blog post
router.get("/", getBlogPosts); // Get all blog posts
router.get("/:slug", getBlogPostBySlug); // Get a single blog post by slug
router.put("/:id", isAuthenticated, updateBlogPost); // Update a blog post by ID
router.delete("/:id", isAuthenticated, deleteBlogPost); // Delete a blog post by ID
router.get("/author/:authorId", getBlogPostsByAuthor); // Get all blog posts by a specific author

export default router;
